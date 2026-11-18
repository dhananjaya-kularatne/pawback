package com.pawback.pawback.service;
import com.pawback.pawback.model.ScanReport;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.*;
import java.util.*;

/** Outbox writes join the business transaction. Provider calls happen only after an atomic committed lease. */
@Service @RequiredArgsConstructor @Slf4j
public class EmailService {
    private final JdbcTemplate jdbc;
    private final MailPayloadCipher cipher;
    private final MailTransport transport;
    private final NotificationFormattingService formatting;
    @Transactional(propagation=Propagation.MANDATORY)
    public void sendPasswordResetOtp(String recipient,String otp){
        enqueue("otp:"+UUID.randomUUID(),recipient,"Your PawBack Password Reset Code",
                "<html><body><h2>Password reset</h2><p>Your verification code is <strong>"+org.springframework.web.util.HtmlUtils.htmlEscape(otp)+"</strong>.</p><p>It expires in ten minutes. Ignore this email if you did not request it.</p></body></html>","OTP",null,600);
    }
    @Transactional(propagation=Propagation.MANDATORY)
    public void sendReportNotification(String recipient,ScanReport report){
        enqueue("report:"+report.getId(),recipient,formatting.buildReportNotificationSubject(report.getPet().getName()),formatting.buildReportNotificationHtml(report),"REPORT",report.getId(),604800);
    }
    private void enqueue(String event,String recipient,String subject,String html,String kind,Long reportId,int ttl){
        jdbc.update("""
            INSERT IGNORE INTO mail_outbox(event_key,recipient,subject,payload,kind,report_id,status,next_attempt_at,expires_at,created_at)
            VALUES(?,?,?,?,?,?,'PENDING',UTC_TIMESTAMP(6),TIMESTAMPADD(SECOND,?,UTC_TIMESTAMP(6)),UTC_TIMESTAMP(6))
            """,event,recipient,subject,cipher.encrypt(html),kind,reportId,ttl);
    }
    @Scheduled(fixedDelayString="${app.mail.interval-ms:30000}")
    public void deliverDue(){
        jdbc.update("UPDATE mail_outbox SET status='DEAD',payload=NULL,last_error='Expired' WHERE status IN ('PENDING','SENDING') AND expires_at<=UTC_TIMESTAMP(6)");
        jdbc.update("DELETE FROM mail_outbox WHERE status IN ('DELIVERED','DEAD') AND created_at<TIMESTAMPADD(DAY,-30,UTC_TIMESTAMP(6))");
        if(!transport.configured()) return;
        var ids=jdbc.queryForList("SELECT id FROM mail_outbox WHERE (status='PENDING' AND next_attempt_at<=UTC_TIMESTAMP(6)) OR (status='SENDING' AND locked_until<UTC_TIMESTAMP(6)) ORDER BY id LIMIT 20",Long.class);
        for(Long id:ids) deliver(id);
    }
    public void deliver(Long id){
        String lease=UUID.randomUUID().toString();
        int claimed=jdbc.update("""
            UPDATE mail_outbox SET status='SENDING',lock_token=?,locked_until=TIMESTAMPADD(SECOND,60,UTC_TIMESTAMP(6)),attempts=attempts+1
            WHERE id=? AND expires_at>UTC_TIMESTAMP(6) AND ((status='PENDING' AND next_attempt_at<=UTC_TIMESTAMP(6)) OR (status='SENDING' AND locked_until<UTC_TIMESTAMP(6)))
            """,lease,id);
        if(claimed==0)return;
        var row=jdbc.queryForMap("SELECT * FROM mail_outbox WHERE id=? AND lock_token=?",id,lease);
        int attempts=((Number)row.get("attempts")).intValue();
        try{
            if("REPORT".equals(row.get("kind")) && jdbc.queryForObject("SELECT COUNT(*) FROM scan_reports r JOIN pets p ON p.id=r.pet_id JOIN users u ON u.id=p.owner_id WHERE r.id=? AND p.deleted_at IS NULL AND u.enabled=1",Integer.class,row.get("report_id"))==0){
                jdbc.update("UPDATE mail_outbox SET status='DEAD',payload=NULL,last_error='Report unavailable' WHERE id=? AND lock_token=?",id,lease);return;
            }
            transport.send((String)row.get("recipient"),(String)row.get("subject"),cipher.decrypt((String)row.get("payload")),"pawback-"+id);
            jdbc.update("UPDATE mail_outbox SET status='DELIVERED',payload=NULL,locked_until=NULL,lock_token=NULL,last_error=NULL WHERE id=? AND lock_token=?",id,lease);
        }catch(Exception exception){
            int delay=Math.min(21600,30*(1<<Math.min(attempts,10)));
            jdbc.update("UPDATE mail_outbox SET status=?,payload=IF(? >=10,NULL,payload),next_attempt_at=TIMESTAMPADD(SECOND,?,UTC_TIMESTAMP(6)),locked_until=NULL,lock_token=NULL,last_error=? WHERE id=? AND lock_token=?",
                    attempts>=10?"DEAD":"PENDING",attempts,delay,exception.getClass().getSimpleName(),id,lease);
            log.warn("Email delivery {} failed on attempt {}; status recorded for retry",id,attempts);
        }
    }
}
