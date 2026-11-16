package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import java.sql.Connection;

// Metadata checks allow both a new database and a baselined Hibernate-era schema.
public class V2__Asset_lifecycle extends BaseJavaMigration {
    @Override public void migrate(Context context) throws Exception {
        Connection db = context.getConnection();
        add(db, "pets", "photo_public_id", "VARCHAR(255)");
        add(db, "pets", "qr_code_public_id", "VARCHAR(255)");
        add(db, "pets", "creation_key", "VARCHAR(64)");
        add(db, "pets", "request_hash", "VARCHAR(64)");
        add(db, "scan_reports", "photo_public_id", "VARCHAR(255)");
        boolean indexed = false;
        try (var indices = db.getMetaData().getIndexInfo(db.getCatalog(), null, "pets", false, false)) {
            while (indices.next()) if ("creation_key".equalsIgnoreCase(indices.getString("COLUMN_NAME")) && !indices.getBoolean("NON_UNIQUE")) indexed = true;
        }
        try (var statement = db.createStatement()) {
            if (!indexed) statement.execute("CREATE UNIQUE INDEX uk_pet_creation_key ON pets(creation_key)");
            statement.execute("CREATE TABLE IF NOT EXISTS asset_cleanup_tasks (public_id VARCHAR(255) PRIMARY KEY, source_url VARCHAR(2048), next_attempt_at DATETIME(6), attempts INT NOT NULL)");
        }
        index(db, "asset_cleanup_tasks", "idx_cleanup_due", "next_attempt_at");
        index(db, "scan_reports", "idx_report_history", "pet_id, created_at, id");
    }
    private void add(Connection db, String table, String column, String type) throws Exception {
        try (var columns = db.getMetaData().getColumns(db.getCatalog(), null, table, column)) {
            if (columns.next()) return;
        }
        try (var statement = db.createStatement()) { statement.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + type); }
    }
    private void index(Connection db, String table, String name, String columns) throws Exception {
        try (var indices = db.getMetaData().getIndexInfo(db.getCatalog(), null, table, false, false)) {
            while (indices.next()) if (name.equalsIgnoreCase(indices.getString("INDEX_NAME"))) return;
        }
        try (var statement = db.createStatement()) { statement.execute("CREATE INDEX " + name + " ON " + table + "(" + columns + ")"); }
    }
}
