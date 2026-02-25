.PHONY: deploy dev

deploy:
	npx wrangler pages deploy . --project-name chombat

dev:
	npx wrangler pages dev .
