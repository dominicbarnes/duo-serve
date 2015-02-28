
# 0.8.0 / 2-28-2015
 * supporting exported array of plugins for `--use` in CLI

# 0.7.1 / 2-28-2015
 * updating deps (`duo@0.9` in particular)

# 0.7.0 / 2-1-2015
 * added `Server#copy()` to hook into copy/symlink logic
 * allowing `body` to be generated via function

# 0.6.1 / 12-02-2014
 * added duo logo as favicon

# 0.6.0 / 11-06-2014
 * added `_duo-serve` bin (`duo-serve` now forks with the `--harmony` flag enabled)
 * fixed asset support, added tests to prevent regression

# 0.5.0 / 10-27-2014
 * updated duo to `0.8.7`
 * added `Server#hook()` to the JS API to post-process the duo build

# 0.4.1 / 10-17-2014
 * updating dependencies all around

# 0.4.0 / 9-27-2014
 * huge internal cleanup, tests added (#1)
 * removed `Server#entries()`
 * changed `Server#entry()` (now accepts an array)
 * changed `Server#use()` (now accepts an array)

# 0.3.2 / 9-26-2014
 * adding support for global export

# 0.3.1 / 9-26-2014
 * fixing arbitrary paths for entries (#10)

# 0.3.0 / 9-26-2014
 * adding support for completely custom HTML (#8)

# 0.2.1 / 9-25-2014
 * added `development:true` and `cache:false` to the duo builder

# 0.2.0 / 9-23-2014
 * body is now loaded on each refresh (so config is now a file path)

# 0.1.2 / 9-14-2014
 * removing now unnecessary gnode dep

# 0.1.1 / 9-13-2014
 * correcting package specs

# 0.1.0 / 9-13-2014
 * adding plugin support
 * adding dev middleware to express app
 * added support for additional assets
 * manifest updates
 * bugfix: project root was always cwd
 * adding debug output

# 0.0.1 / 9-12-2014
 * initial release
