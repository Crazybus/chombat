.PHONY: deploy dev build format clean data lint

format:
	npx prettier --write "*.js" "*.css" "*.html"

data:
	python3 convert_units.py

build: clean format lint
	mkdir -p dist
	npx esbuild script.js units.js techs.js bonuses.js presets.js scenarios.js --minify --outdir=dist
	npx esbuild styles.css --minify --outfile=dist/styles.css
	cp index.html dist/index.html
	cp _headers dist/_headers

deploy: build
	npm cache clean --force
	npx wrangler pages deploy dist --project-name chombat --branch production
	@if [ -n "$$CLOUDFLARE_ZONE_ID" ] && [ -n "$$CLOUDFLARE_API_TOKEN" ]; then \
		echo "Purging Cloudflare cache..."; \
		curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$$CLOUDFLARE_ZONE_ID/purge_cache" \
			-H "Authorization: Bearer $$CLOUDFLARE_API_TOKEN" \
			-H "Content-Type: application/json" \
			--data '{"purge_everything":true}' | grep -q '"success":true' && echo "Cache purged successfully!" || echo "Cache purge failed."; \
	fi

dev: build
	npx wrangler pages dev dist

lint:
	npx eslint .

clean:
	rm -rf dist
