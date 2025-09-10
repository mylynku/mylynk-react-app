# Frontend-Backend Route Mappings

## Authentication Routes

| Frontend Call | Backend Route | HTTP Method | Verified |
|--------------|--------------|------------|----------|
| `/auth/login` | `/auth/login` | POST | ✅ |
| `/auth/register` | `/auth/register` | POST | ✅ |
| `/auth/me` | `/auth/me` | GET | ✅ |
| `/auth/logout` | `/auth/logout` | POST | ✅ |
| `/auth/google` | `/auth/google` | GET | ✅ |
| `/auth/apple` | `/auth/apple` | GET | ✅ |

## Session Routes

| Frontend Call | Backend Route | HTTP Method | Verified | Notes |
|--------------|--------------|------------|----------|-------|
| `/sessions` | `/sessions` | GET | ✅ | Fixed in frontend |
| `/sessions` | `/sessions` | POST | ✅ | Fixed in frontend |

## Payment Routes

| Frontend Call | Backend Route | HTTP Method | Verified | Notes |
|--------------|--------------|------------|----------|-------|
| `/payment/create-order` | `/payment/create-order` | POST | ✅ | Fixed in frontend |
| `/payment/verify` | `/payment/verify` | POST | ✅ | Fixed in frontend |

## User Profile Routes

| Frontend Call | Backend Route | HTTP Method | Verified | Notes |
|--------------|--------------|------------|----------|-------|
| `/users` | `/users` | GET | ❌ | Frontend uses mock data |
| `/users/:userId` | `/users/:userId` | GET | ❌ | Frontend uses mock data |

## Action Items
- Update frontend to use backend user profile endpoints
- Remove mock data implementation