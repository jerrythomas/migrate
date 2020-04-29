# Testing import

Import testing will end up creating tables and schemas which may conflict.

## Data

These are insert statements with following possibilities.

* table does not exist
* table exists but columns present in insert are not in the tables
* Columns are same but sizes or types do not match. This will have multiple scenarios one for each type.
* columns and types match

spec_table_data schema will be used for all data related tests

## Table

Table/View creation.

Table export causes table data to be exported also
Table import can work without data.

* Invalid schema
* Table/object already exists
* Invalid data type or syntax
* Table gets created.

spec_table

## Schema

Schema export causes tables and views to be exported and the same will be imported
Schema import on its own just creates schema

* Schema already exists
* Schema creation causes

* spec_exp_schema
* spec_imp_schema
* spec_schema_exists
* spec_imp_object
  * imp_table
  * imp_view
  * imp_data
  * imp_view_exists
  * imp_table_exists
  * imp_missing_col
  * imp_invalid_<coltype>
* spec_exp_object
  * imp_table
  * imp_view
  * imp_data

## Data setup on target prior to test

create schema spec_imp_object
create schema spec_schema_exists
create table imp_table_exists
create view view_exists
create table imp_missing_col
create table imp_invalid_<coltype> (for all call types)


# data set up on source

test if export succeeds. If possible verify that other related tasks are submitted and import is also complete.

create schema spec_exp_schema
  table_<coltype>
  insert 3 rows for each table
  table_pk
  table_fk
  table_index
  view
