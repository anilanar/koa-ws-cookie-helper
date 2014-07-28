test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
			--harmony-generators

clean:
	@rm -rf node_modules

.PHONY: test clean