/*
 * Copyright (c) 2014 Intel Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Tests if the  library is correctly installed. File is named
 * aaa-install.js so that when the test runner ('mocha') sorts test files, this
 * one will be run first. If any test in this suite fails, ignore errors
 * in the rest of the tests.
 * @module test/install
 * @see module:test/install~configuration
 * @see module:test/install~nohome
 */

var expect = require('chai').expect;

describe('[install][sanity]', function () {
  beforeEach(function () {
    // will need to reload 'iotkit-comm' each time, instead of using
    // cached version like node would prefer.
    var name = require.resolve('iotkit-comm');
    delete require.cache[name];
  });

  /**
   * @function module:test/install~configuration
   */
  it("should verify if library is correctly installed", function (done) {
    var iotkit = require('iotkit-comm');
    expect(iotkit.sayhello()).to.equal("Hello Edison user!");
    done();
  });

  /**
   * @function module:test/install~nohome
   */
  it("should not fail if HOME environment variable is not present", function (done) {
    var savedhome = "";
    if (process.env.HOME) {
      savedhome = process.env.HOME;
      delete process.env.HOME;
    }

    var iotkit = require('iotkit-comm');

    if (savedhome)
      process.env.HOME = savedhome;

    done();
  });
});