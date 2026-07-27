package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations() {
	host := os.Getenv("DATABASE_HOST")
	port := os.Getenv("DATABASE_PORT")
	user := os.Getenv("DATABASE_USER")
	password := os.Getenv("DATABASE_PASSWORD")
	dbname := os.Getenv("DATABASE_NAME")

	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbname)

	migrationsPath := os.Getenv("MIGRATIONS_PATH")
	if migrationsPath == "" {
		execPath, err := os.Executable()
		if err != nil {
			log.Printf("[MIGRATE] Gagal dapat path executable: %v", err)
			return
		}
		migrationsPath = filepath.Join(filepath.Dir(execPath), "database", "migrations")
	}

	sourceURL := "file://" + migrationsPath

	m, err := migrate.New(sourceURL, dbURL)
	if err != nil {
		log.Printf("[MIGRATE] Gagal inisialisasi migrate: %v", err)
		return
	}
	defer m.Close()

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Printf("[MIGRATE] Gagal menjalankan migration: %v", err)
		return
	}

	log.Println("[MIGRATE] Database up-to-date")
}
