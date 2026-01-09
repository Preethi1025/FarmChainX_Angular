package com.FarmChainX.backend.Config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashSet;
import java.util.Set;

@Component
@Order(1)
public class DatabaseInitializer implements CommandLineRunner {

    private final DataSource dataSource;

    public DatabaseInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {

        try (Connection connection = dataSource.getConnection()) {
            System.out.println("\n====================================================");
            System.out.println("🔧 Database Initialization Started");
            System.out.println("====================================================");

            DatabaseMetaData metaData = connection.getMetaData();

            ResultSet tables = metaData.getTables(null, null, "crops", new String[] { "TABLE" });

            if (tables.next()) {
                System.out.println("➡ Existing crops table detected. Checking structure...");

                ResultSet columns = metaData.getColumns(null, null, "crops", null);
                Set<String> existingColumns = new HashSet<>();

                while (columns.next()) {
                    existingColumns.add(columns.getString("COLUMN_NAME"));
                }

                try (Statement stmt = connection.createStatement()) {

                    String[][] requiredColumns = {
                            { "crop_type", "VARCHAR(255)" },
                            { "quality_grade", "VARCHAR(50)" },
                            { "location", "VARCHAR(255)" },
                            { "actual_harvest_date", "VARCHAR(255)" },
                            { "qr_code_url", "TEXT" }
                    };

                    for (String[] col : requiredColumns) {
                        String colName = col[0];
                        String type = col[1];

                        if (!existingColumns.contains(colName)) {
                            System.out.println("⚠️ Adding missing column: " + colName);
                            stmt.execute("ALTER TABLE crops ADD COLUMN " + colName + " " + type);
                        }
                    }
                }

                System.out.println(" Crops table schema updated!");

            } else {
                System.out.println(" Crops table not found — creating new table...");

                try (Statement stmt = connection.createStatement()) {
                    createCropsTable(stmt);
                }

                System.out.println(" New crops table created!");
            }

            // Check if listings table exists
            ResultSet listingsTables = metaData.getTables(null, null, "listings", new String[] { "TABLE" });
            if (!listingsTables.next()) {
                System.out.println(" Listings table not found — creating new table...");
                try (Statement stmt = connection.createStatement()) {
                    createListingsTable(stmt);
                }
                System.out.println("New listings table created!");
            } else {
                System.out.println(" Listings table already exists.");
            }

            // Check if batch_records table exists
            ResultSet batchTables = metaData.getTables(null, null, "batch_records", new String[] { "TABLE" });
            if (!batchTables.next()) {
                System.out.println(" Batch records table not found — creating new table...");
                try (Statement stmt = connection.createStatement()) {
                    createBatchRecordsTable(stmt);
                }
                System.out.println(" New batch_records table created!");
            } else {
                System.out.println(" Batch records table already exists.");
            }

            System.out.println("====================================================");
            System.out.println(" Database Initialization Complete");
            System.out.println("====================================================");

        } catch (Exception e) {
            System.err.println("\n DATABASE INITIALIZATION FAILED ");
            System.err.println("Error: " + e.getMessage());
            throw e;
        }
    }

    private void createCropsTable(Statement stmt) throws Exception {
        String sql = """
                CREATE TABLE IF NOT EXISTS crops (
                    crop_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    farmer_id VARCHAR(255) NOT NULL,
                    batch_id VARCHAR(255) NOT NULL UNIQUE,
                    crop_name VARCHAR(255) NOT NULL,
                    crop_type VARCHAR(255),
                    price DOUBLE,
                    quantity DOUBLE,
                    quality_grade VARCHAR(50),
                    location VARCHAR(255),
                    actual_harvest_date VARCHAR(255),
                    qr_code_url TEXT,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_farmer_id (farmer_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """;

        stmt.execute(sql);
    }

    private void createListingsTable(Statement stmt) throws Exception {
        String sql = """
                CREATE TABLE IF NOT EXISTS listings (
                    listing_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    crop_id BIGINT NOT NULL,
                    farmer_id VARCHAR(255) NOT NULL,
                    batch_id VARCHAR(255),
                    price DOUBLE,
                    quantity DOUBLE,
                    status VARCHAR(50) DEFAULT 'ACTIVE',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_crop_id (crop_id),
                    INDEX idx_farmer_id (farmer_id),
                    INDEX idx_batch_id (batch_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """;

        stmt.execute(sql);
    }

    private void createBatchRecordsTable(Statement stmt) throws Exception {
        String sql = """
                                CREATE TABLE IF NOT EXISTS batch_records (
                    batch_id VARCHAR(255) PRIMARY KEY,
                    farmer_id VARCHAR(255),
                    crop_type VARCHAR(255),
                    total_quantity DECIMAL(12,2),
                    remaining_quantity DECIMAL(12,2) DEFAULT 0,
                    lifecycle_status VARCHAR(50) DEFAULT 'PLANTED',
                    avg_quality_score DECIMAL(5,2),
                    harvest_date DATE,
                    qr_code_url VARCHAR(1024),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
                );

                                """;

        stmt.execute(sql);
    }
}
