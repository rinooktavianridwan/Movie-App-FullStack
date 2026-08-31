package seed

import (
	"fmt"
	"log"
	"os"

	"movie-app-go/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedUsers(db *gorm.DB) error {
	var adminRole models.Role
	if err := db.Where("name = ?", "admin").First(&adminRole).Error; err != nil {
		return err
	}

	email := os.Getenv("SEEDER_EMAIL")
	password := os.Getenv("SEEDER_PASSWORD")
	if email == "" || password == "" {
		return fmt.Errorf("SEEDER_EMAIL and SEEDER_PASSWORD must be set in .env")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := models.User{
		Name:     "Admin",
		Email:    email,
		Password: string(hashed),
		RoleID:   &adminRole.ID,
	}

	if err := db.Create(&user).Error; err != nil {
		return err
	}

	log.Printf("Seeded admin user: %s", email)
	return nil
}
