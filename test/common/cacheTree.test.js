const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { test } = require('tap');
const { cacheTree } = require('../../common/functions');
const ValidationError = require('../../common/errors');
const { buildTree } = require('../helper');

test('Handle invalid or empty paths.', async (t) => {
  let loc = 'zzz-cache';

  t.plan(6)
  rimraf.sync(loc)
  t.notok(fs.existsSync(loc));
  try {
    let res = cacheTree(loc);
  } catch (error) {
    t.ok(error instanceof ValidationError, 'Should throw ValidationError when path does not exist.');
  }

  fs.writeFileSync(loc,'');
  t.notok(fs.statSync(loc).isDirectory());
  try {
    let res = cacheTree(loc);
  } catch (error) {
    t.ok(error instanceof ValidationError, 'Should throw ValidationError when path is a file.');
  }
  fs.unlinkSync(loc);

  fs.mkdirSync(loc);
  t.ok(fs.statSync(loc).isDirectory());
  t.same(cacheTree(loc), null, "Empty folder results in empty object.");
  rimraf.sync(loc);

  t.end();
})

test('Handle defaults.', async (t) => {
  const base = 'tmp';
  const tree = {
    one: {
      two: {
        three: {
          file_three_1: 'some comtent',
          file_three_2: 'some content'
        },
        file_two: 'some content'
      },
      file_one: 'some content'
    }
  }

  t.plan(1);
  rimraf.sync(base)
  buildTree(base, tree)
  process.chdir(base);
  t.same(cacheTree(), tree, 'Default pulls data from current path.')
  process.chdir('..');
  rimraf.sync(base);
  t.end();
})

test('Handle custom path and filters', async (t) => {
  const base = 'xyz';
  const tree = {
    one: {
      two: {
        three: {
          file_three_1: 'some comtent',
          file_three_2: 'some content'
        },
        file_two: 'some content'
      },
      file_one: 'some content'
    }
  }

  t.plan(3)
  rimraf.sync(base)
  buildTree(base, tree)
  //process.chdir(base);
  t.same(cacheTree(base), tree, 'Default pulls data from current path.')
  rimraf.sync(base);

  buildTree(base, tree, 'js')
  t.same(cacheTree(base, 'txt'), null, 'Files not matching pattern are excluded.')
  t.same(cacheTree(base, 'js'), tree, 'Files matching pattern are loaded into tree.')
  rimraf.sync(base);
  t.end();
})
