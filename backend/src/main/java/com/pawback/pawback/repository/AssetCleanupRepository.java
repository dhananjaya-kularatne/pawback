package com.pawback.pawback.repository;

import com.pawback.pawback.model.AssetCleanupTask;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;

public interface AssetCleanupRepository extends JpaRepository<AssetCleanupTask, String> {
    List<AssetCleanupTask> findTop50ByNextAttemptAtBeforeOrderByNextAttemptAtAsc(Instant now);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from AssetCleanupTask t where t.publicId = :id")
    Optional<AssetCleanupTask> lockById(String id);
    @Modifying
    @Query("delete from AssetCleanupTask t where t.publicId = :id")
    void removeById(String id);
}
