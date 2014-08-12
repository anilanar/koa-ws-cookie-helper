test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
			--harmony-generators

test-cov-gen:
		@NODE_ENV=test node --harmony node_modules/istanbul/lib/cli.js cover \
			-x "test.js" \
			./node_modules/mocha/bin/_mocha -- -R spec

test-cov: 
	@NODE_ENV=test node --harmony node_modules/istanbul/lib/cli.js cover \
			-x "test.js" \
			./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec && \
			cat ./coverage/lcov.info | \
			node --harmony ./node_modules/coveralls/bin/coveralls.js \
			&& rm -rf ./coverage

clean:
	@rm -rf node_modules

.PHONY: test test-cov-gen test-cov clean