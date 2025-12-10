from fastapi import Request
from sqlalchemy.orm import Session
import models  # Your SQLAlchemy models
from typing import Optional

def log_admin_action(
    db: Session,
    admin: models.Admin,
    request: Request,
    actiontype: str,
    actiondescription: str,
    affectedtable: Optional[str] = None,
    status: str = "Success"
):
    """
    Creates a new system log entry for an admin action.
    This function should be called *before* db.commit() in the endpoint.
    """
    try:
        
        ip_address = request.client.host if request.client else "unknown"
        
        new_log = models.SystemLog(
            adminid=admin.adminid,
            actiontype=actiontype,
            actiondescription=actiondescription,
            affectedtable=affectedtable,
            ip_address=ip_address,
            status=status
        )
        
        db.add(new_log)
        
        
    except Exception as e:
        print(f"--- CRITICAL: ADMIN LOGGING FAILED ---")
        print(f"Admin: {admin.email}, Action: {actiontype}")
        print(f"Error: {e}")