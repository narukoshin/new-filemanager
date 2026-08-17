package role

// Role identifies a user's authorization role.
type Role string

const (
	// RoleViewer grants read-only access.
	RoleViewer Role = "viewer"
	// RoleAdmin grants administrative access.
	RoleAdmin Role = "admin"
	// RoleArchitect grants architecture-level access.
	RoleArchitect Role = "architect"
)

// RoleMap maps supported role names to their Role values.
var RoleMap = map[string]Role{
	"viewer":    RoleViewer,
	"admin":     RoleAdmin,
	"architect": RoleArchitect,
}

// DefaultRole is assigned when no role is specified.
const DefaultRole = RoleViewer

// String returns the string representation of r.
func (r Role) String() string {
	return string(r)
}

// IsValid reports whether role names a supported role.
func IsValid(role string) bool {
	for _, r := range RoleMap {
		if r.String() == role {
			return true
		}
	}
	return false
}
