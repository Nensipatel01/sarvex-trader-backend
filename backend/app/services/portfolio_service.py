from sqlalchemy.orm import Session
from app.models.models import BrokerAccount, User
from app.services.broker_service import BrokerService

class PortfolioService:
    def __init__(self, db: Session):
        self.db = db

    def get_unified_portfolio(self, user_id: int):
        """Aggregates all positions and holdings for a user."""
        accounts = self.db.query(BrokerAccount).filter(BrokerAccount.user_id == user_id, BrokerAccount.status == "CONNECTED").all()
        
        unified_positions = []
        unified_holdings = []
        total_balance = 0.0

        for account in accounts:
            try:
                service = BrokerService(self.db)
                service.login(account)
                
                # Fetch real data
                positions = service.get_positions()
                holdings = service.get_holdings()
                
                unified_positions.extend(positions)
                unified_holdings.extend(holdings)
                total_balance += float(account.balance)
            except Exception as e:
                print(f"Error fetching portfolio for account {account.id}: {e}")

        return {
            "total_balance": total_balance,
            "positions": unified_positions,
            "holdings": unified_holdings,
            "account_count": len(accounts)
        }
