#!/usr/bin/env python3
"""
Clean up hederaTools and related Hedera endpoints from swagger.json
"""
import json
import sys

def clean_swagger(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            swagger = json.load(f)
        
        # Endpoints to remove
        endpoints_to_remove = [
            '/hedera-tools/create-token',
            '/hedera-tools/create-topic',
            '/hedera-tools/submit-message',
            '/hedera-tools/balance',
            '/hedera-tools/my-balance',
            '/hedera-tools/tools',
            '/hedera-tools/create-evaluation-topic',
            '/hedera-tools/submit-evaluation-message',
            '/api/create-agent',
            '/api/create-token',
            '/api/create-talentai-token',
            '/api/mint-tokens'
        ]
        
        removed_count = 0
        for endpoint in endpoints_to_remove:
            if endpoint in swagger.get('paths', {}):
                del swagger['paths'][endpoint]
                removed_count += 1
                print(f'✓ Removed endpoint: {endpoint}')
        
        # Remove 'Hedera Tools' tag
        if 'tags' in swagger:
            original_tags = len(swagger['tags'])
            swagger['tags'] = [tag for tag in swagger['tags'] if tag.get('name') != 'Hedera Tools']
            if len(swagger['tags']) < original_tags:
                print(f'✓ Removed "Hedera Tools" tag')
        
        # Save the cleaned swagger.json
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(swagger, f, indent=2, ensure_ascii=False)
        
        print(f'\n✅ Successfully cleaned {file_path}')
        print(f'   - Removed {removed_count} endpoints')
        return True
    
    except Exception as e:
        print(f'❌ Error cleaning {file_path}: {e}')
        return False

if __name__ == '__main__':
    files_to_clean = [
        'Backend/swagger.json',
        'Backend/swagger-complete.json'
    ]
    
    for file in files_to_clean:
        clean_swagger(file)
