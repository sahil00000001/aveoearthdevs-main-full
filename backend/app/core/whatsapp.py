import httpx
from typing import Dict, Any
from app.core.config import settings
from app.core.exceptions import ExternalServiceException, ValidationException
from app.core.logging import get_logger

logger = get_logger("whatsapp")

class WhatsAppService:
    def __init__(self):
        self.api_url = settings.WHATSAPP_API_URL
        self.api_token = settings.WHATSAPP_API_TOKEN
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        
        if not all([self.api_url, self.api_token, self.phone_number_id]):
            raise ValidationException("WhatsApp API credentials not configured")
    
    async def send_otp(self, phone: str, otp_code: str) -> Dict[str, Any]:
        try:
            headers = {
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json"
            }
            
            clean_phone = phone.replace("+", "").replace("-", "").replace(" ", "")
            
            message_body = {
                "messaging_product": "whatsapp",
                "to": clean_phone,
                "type": "template",
                "template": {
                    "name": "aveo_otp",
                    "language": {"code": "en"},
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {"type": "text", "text": otp_code}
                            ]
                        }
                    ]
                }
            }
            
            url = f"{self.api_url}/{self.phone_number_id}/messages"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=message_body,
                    headers=headers,
                    timeout=30
                )
                
                if response.status_code != 200:
                    logger.error(f"WhatsApp API error: {response.status_code} - {response.text}")
                    raise ExternalServiceException(f"WhatsApp API error: {response.status_code}", "WhatsApp")
                
                result = response.json()
                
                if result.get("error"):
                    logger.error(f"WhatsApp API error: {result['error']}")
                    raise ExternalServiceException(f"WhatsApp error: {result['error']['message']}", "WhatsApp")
                
                logger.info(f"OTP sent successfully to {phone}")
                return {
                    "success": True,
                    "message_id": result.get("messages", [{}])[0].get("id"),
                    "phone": phone
                }
                
        except ExternalServiceException:
            raise
        except Exception as e:
            logger.error(f"WhatsApp service error: {str(e)}")
            raise ExternalServiceException(f"Failed to send OTP: {str(e)}", "WhatsApp")
    
    async def send_simple_message(self, phone: str, message: str) -> Dict[str, Any]:
        try:
            headers = {
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json"
            }
            
            clean_phone = phone.replace("+", "").replace("-", "").replace(" ", "")
            
            message_body = {
                "messaging_product": "whatsapp",
                "to": clean_phone,
                "type": "text",
                "text": {"body": message}
            }
            
            url = f"{self.api_url}/{self.phone_number_id}/messages"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=message_body,
                    headers=headers,
                    timeout=30
                )
                
                if response.status_code != 200:
                    logger.error(f"WhatsApp API error: {response.status_code} - {response.text}")
                    raise ExternalServiceException(f"WhatsApp API error: {response.status_code}", "WhatsApp")
                
                result = response.json()
                
                if result.get("error"):
                    logger.error(f"WhatsApp API error: {result['error']}")
                    raise ExternalServiceException(f"WhatsApp error: {result['error']['message']}", "WhatsApp")
                
                logger.info(f"Message sent successfully to {phone}")
                return {
                    "success": True,
                    "message_id": result.get("messages", [{}])[0].get("id"),
                    "phone": phone
                }
                
        except ExternalServiceException:
            raise
        except Exception as e:
            logger.error(f"WhatsApp service error: {str(e)}")
            raise ExternalServiceException(f"Failed to send message: {str(e)}", "WhatsApp")

def get_whatsapp_service() -> WhatsAppService:
    return WhatsAppService()
