#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os

# Read the API endpoints JSON
with open('API_ENDPOINTS.json', 'r', encoding='utf-8') as f:
    endpoints_data = json.load(f)

# Create Postman collection v2.1 structure
collection = {
    'info': {
        'name': 'TalentAI Backend API',
        'description': 'Complete API collection for TalentAI Backend with 256+ endpoints - All endpoints properly grouped by module with variables for base_url and authentication token',
        'schema': 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        'version': '1.0.0'
    },
    'variable': [
        {
            'key': 'base_url',
            'value': 'http://localhost:3000',
            'type': 'string',
            'description': 'API Base URL - Change to your server URL'
        },
        {
            'key': 'token',
            'value': 'your_jwt_token_here',
            'type': 'string',
            'description': 'JWT Authentication Token - Get from login/auth endpoint'
        },
        {
            'key': 'api_key',
            'value': 'your_api_key_here',
            'type': 'string',
            'description': 'API Key for API key authenticated endpoints'
        }
    ],
    'item': []
}

# Helper function to extract real-looking example data
def get_example_request_body(endpoint):
    if not endpoint.get('requestBody') or not endpoint['requestBody'].get('example'):
        return None
    return endpoint['requestBody']['example']

# Helper function to build auth header
def get_auth_header(endpoint):
    auth = endpoint.get('authentication', 'Public')
    if 'JWT' in auth or 'Protected' in auth:
        return {
            'key': 'Authorization',
            'value': 'Bearer {{token}}',
            'type': 'text'
        }
    return None

# Helper function to build request
def build_request(endpoint):
    method = endpoint['method']
    full_path = endpoint['path']
    description = endpoint.get('description', '')
    
    request = {
        'name': f"{method} {full_path}",
        'description': description,
        'request': {
            'method': method,
            'header': [],
            'url': {
                'raw': f"{{{{base_url}}}}{full_path}",
                'protocol': 'http',
                'host': ['{{base_url}}']
            }
        },
        'response': []
    }
    
    # Build URL path segments properly
    path_parts = full_path.lstrip('/').split('/')
    request['request']['url']['path'] = path_parts
    
    # Add Auth header
    auth_header = get_auth_header(endpoint)
    if auth_header:
        request['request']['header'].append(auth_header)
    
    # Add Content-Type for POST/PUT/PATCH
    if method in ['POST', 'PUT', 'PATCH']:
        request['request']['header'].append({
            'key': 'Content-Type',
            'value': 'application/json',
            'type': 'text'
        })
    
    # Add body
    if method in ['POST', 'PUT', 'PATCH']:
        body_example = get_example_request_body(endpoint)
        if body_example:
            request['request']['body'] = {
                'mode': 'raw',
                'raw': json.dumps(body_example, indent=2),
                'options': {
                    'raw': {
                        'language': 'json'
                    }
                }
            }
    
    # Add query parameters
    if endpoint.get('queryParameters'):
        params = []
        for param in endpoint['queryParameters']:
            params.append({
                'key': param['name'],
                'value': f"example_{param['name']}",
                'disabled': False,
                'description': param.get('description', '')
            })
        if params:
            request['request']['url']['query'] = params
    
    return request

# Group endpoints by module
modules = {}
auth_endpoints = []

for route_info in endpoints_data:
    base_prefix = route_info['basePrefix']
    
    # Special handling for authentication
    if 'auth' in base_prefix.lower():
        module_name = 'Authentication'
        for endpoint in route_info['endpoints']:
            auth_endpoints.append(build_request(endpoint))
    else:
        # Extract module name from prefix
        temp = base_prefix.replace('/api/', '').replace('/admin/', '').replace('/', ' ').strip()
        module_name = temp.title() if temp else 'Other'
        
        if module_name not in modules:
            modules[module_name] = []
        
        for endpoint in route_info['endpoints']:
            modules[module_name].append(build_request(endpoint))

# Build the collection items - Auth first, then others
if auth_endpoints:
    collection['item'].append({
        'name': '🔐 Authentication',
        'description': 'User authentication and authorization endpoints',
        'item': auth_endpoints
    })

# Add other modules sorted by name
for module_name in sorted(modules.keys()):
    collection['item'].append({
        'name': module_name,
        'description': f"{module_name} endpoints",
        'item': modules[module_name]
    })

# Save the collection
output_path = 'postman_collection.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(collection, f, indent=2, ensure_ascii=False)

print("✅ Postman collection generated successfully!")
print(f"📊 Statistics:")
total = sum(len(v) for v in modules.values()) + len(auth_endpoints)
print(f"   - Total endpoints: {total}")
print(f"   - Authentication endpoints: {len(auth_endpoints)}")
print(f"   - Module groups: {len(modules) + 1}")
print(f"   - Output file: {output_path}")
print(f"\n📁 Modules included:")
print(f"   - 🔐 Authentication ({len(auth_endpoints)} endpoints)")
for module_name in sorted(modules.keys()):
    print(f"   - {module_name} ({len(modules[module_name])} endpoints)")
