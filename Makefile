.PHONY: deploy dev

deploy:
	npx wrangler pages deploy . --project-name chombat --branch production

dev:
	npx wrangler pages dev .
