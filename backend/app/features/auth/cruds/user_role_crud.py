from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.core.logging import get_logger

logger = get_logger("crud.user_roles")

class UserRoleCrud(BaseCrud):
    def __init__(self):
        super().__init__(get_supabase_client(), "user_roles", None)
        self.logger = get_logger("crud.user_roles")
