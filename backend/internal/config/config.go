package config

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
	Version string
)

// SetVersion sets the version of the application
func SetVersion(version string) {
	Version = version
}

// GetVersion returns the version of the application
func GetVersion() string {
	return Version
}

func Load() (*Config, error) {
	return nil, nil
}