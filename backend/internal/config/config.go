package config

import (
	"os"

	"github.com/creasty/defaults"
	"gopkg.in/yaml.v3"
)

// Config contains the application's server, logging, and storage settings.
type Config struct {
	// Server contains settings for the HTTP server.
	Server ServerConfig `yaml:"server"`
	// Logging contains settings for application logging.
	Logging LoggingConfig `yaml:"logging"`
	// Storage contains settings for storage providers.
	Storage StorageConfig `yaml:"storage"`
	// Database contains settings for database providers.
	Database DatabaseConfig `yaml:"database"`
	//
	Security SecurityConfig `yaml:"security"`
}

// ServerConfig contains settings for the HTTP server.
type ServerConfig struct {
	// Port is the TCP port on which the server listens.
	Port string `yaml:"port" default:"8080"`
}

// LoggingConfig contains settings for application logging.
type LoggingConfig struct {
	// Level is the minimum severity level to log.
	Level string `yaml:"level"`
	// File is the path of the optional log file.
	File string `yaml:"file"`
}

// StorageConfig contains settings for storage providers.
type StorageConfig struct {
	// Cloudflare contains settings for Cloudflare storage.
	Cloudflare CloudflareConfig `yaml:"cloudflare"`
}

// CloudflareConfig contains settings for Cloudflare storage.
type CloudflareConfig struct {
	// BucketName is the name of the Cloudflare bucket.
	BucketName string `yaml:"bucket_name"`
	// AccountID is the Cloudflare account ID.
	AccountID string `yaml:"account_id"`
	// AccessKeyID is the Cloudflare access key ID.
	AccessKeyID string `yaml:"access_key_id"`
	// AccessKeySecret is the Cloudflare access key secret.
	AccessKeySecret string `yaml:"access_key_secret"`
}

// DatabaseConfig contains settings for database providers.
type DatabaseConfig struct {
	// SQLite3 contains settings for SQLite3 database.
	SQLite3 SQLite3Config `yaml:"sqlite3"`
}

// SQLite3Config contains settings for SQLite3 database.
type SQLite3Config struct {
	// File is the path of the SQLite3 database file.
	File string `yaml:"file"`
}

type SecurityConfig struct {
	JWT JWTConfig `yaml:"jwt"`
}

type JWTConfig struct {
	Secret string `yaml:"secret"`
}

var (
	// ConfigFileName is the default configuration file name.
	ConfigFileName = "config.yaml"
	// Conf contains the loaded application configuration.
	Conf *Config
	// Version is the current application version.
	Version string
)

// SetVersion sets the application version.
func SetVersion(version string) {
	Version = version
}

// GetVersion returns the application version.
func GetVersion() string {
	return Version
}

// Load reads, validates, and stores the application configuration.
func Load() error {
	// set defaults
	obj := &Config{}
	err := defaults.Set(obj)
	if err != nil {
		return err
	}
	path, err := os.Getwd()
	if err != nil {
		return err
	}

	filePath := path + "/config/config.yml"

	if _, err = os.Stat(filePath); os.IsNotExist(err) {
		return err
	}
	// unmarshal the config file
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()
	// decode the YAML file
	decoder := yaml.NewDecoder(file)
	decoder.KnownFields(true)
	err = decoder.Decode(obj)
	if err != nil {
		return err
	}
	// validate the configuration
	if err := Validate(); err != nil {
		return err
	}
	Conf = obj
	return nil
}

// Validate validates the application configuration.
func Validate() error {
	return nil
}
