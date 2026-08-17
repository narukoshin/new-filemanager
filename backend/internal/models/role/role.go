package role

type Role string

const (
	RoleViewer    Role = "viewer"
	RoleAdmin     Role = "admin"
	RoleArchitect Role = "architect"
)

var RoleMap = map[string]Role{
	"viewer":    RoleViewer,
	"admin":     RoleAdmin,
	"architect": RoleArchitect,
}

const DefaultRole = RoleViewer

func (r Role) String() string {
	return string(r)
}

func IsValid(role string) bool {
	for _, r := range RoleMap {
		if r.String() == role {
			return true
		}
	}
	return false
}
