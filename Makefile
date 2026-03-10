.PHONY: deploy preview dev build format clean data lint test dev-pages hook install

# Standard development server (Vite)
dev:
	npm run dev

# Local Cloudflare Pages emulation
dev-pages: build
	npx wrangler pages dev dist

# Generate unit data from source files
data:
	python3 utils/import_game_data.py
	make format

# Production build
build: clean
	npm run build

install:
	npm install

# Hook target to run all important steps before commiting
hook: build test format lint

# Code formatting
format:
	npx prettier --write .

# Deployment to preview branch
preview: build
	npx wrangler pages deploy dist --project-name chombat

# Production deployment
deploy: build
	npx wrangler pages deploy dist --project-name chombat --branch production
	@if [ -n "$$CLOUDFLARE_ZONE_ID" ] && [ -n "$$CLOUDFLARE_API_TOKEN" ]; then \
		echo "Purging Cloudflare cache..."; \
		curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$$CLOUDFLARE_ZONE_ID/purge_cache" \
			-H "Authorization: Bearer $$CLOUDFLARE_API_TOKEN" \
			-H "Content-Type: application/json" \
			--data '{"purge_everything":true}' | grep -q '"success":true' && echo "Cache purged successfully!" || echo "Cache purge failed."; \
	fi

# Linting
lint:
	npm run lint

# Cleanup
clean:
	rm -rf dist

# Run unit tests
test:
	npm test
