package config

import (
	"os"

	"github.com/creasty/defaults"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Logging LoggingConfig `yaml:"logging"`
	Storage StorageConfig `yaml:"storage"`
}

type LoggingConfig struct {
	Level string `yaml:"level"`
	File  string `yaml:"file"`
}

type StorageConfig struct {
	Cloudflare CloudflareConfig `yaml:"cloudflare"`
}

type CloudflareConfig struct {
}

var (
	ConfigFileName = "config.yaml"
	Conf           *Config
	Version        string
)

// SetVersion sets the version of the application
func SetVersion(version string) {
	Version = version
}

// GetVersion returns the version of the application
func GetVersion() string {
	return Version
}

// Load loads the configuration file
func Load() error {
	// set defaults
	err := defaults.Set(&Config{})
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
	err = decoder.Decode(&Conf)
	if err != nil {
		return err
	}
	// validate the configuration
	if err := Validate(); err != nil {
		return err
	}
	return nil
}

// Validate validates the configuration
func Validate() error {
	return nil
}
