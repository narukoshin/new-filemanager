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
