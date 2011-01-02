Request.YQL
=================

Request.YQL is, like its name suggest an extension to the MooTools request object. It comes along with an really handy and useful query builder.


*Request.YQL(query, [options])*

Parameters:

  - **query** String || instance of Request.YQL.QueryBilder
  - **options** Object. See options below. Also inherited are all the options from [Request (.JSONP)][1]  

Options:

  - **format** String 'xml' or 'json'. The response format. Defaults to 'json'.

Requires:

  - MooTools 1.3
  - MooTools More 1.3 - JSONP 

How To Use
--------

*#1* Simple string based query

    var query = "SELECT id, name, url FROM music.artist.similar WHERE id = '306489' LIMIT 5";
    
    var request = new Request.YQL(query, {
      format: 'xml',
      onComplete: function(result) {
            console.log(result);
        }
    }).send();


*#2* Example #1 built with QueryBuilder

    var query = new Request.YQL.QueryBuilder;
        query.select('id', 'name', 'url')
             .from('music.artist.similar')
             .where('id = 306489')
             .limit(5);
              
    var request = new Request.YQL(query, {
      onComplete: function(result) {
            console.log(result);
        }
    }).send();   


*#3* USE statement support

    var query = new Request.YQL.QueryBuilder;
        query.select('*')
             .where('url = "www.yahoo.com"')
             .andWhere('css = "a"')
             .use('http://yqlblog.net/samples/data.html.cssselect.xml', 'data.html.cssselect')
              
    var request = new Request.YQL(query, {
      onComplete: function(result) {
            console.log(result);
        }
    }).send(); 

*#4* SubSelect support

    var query = new Request.YQL.QueryBuilder;
        query.select('start_date')
             .from('upcoming.events')
             .where(query.expr().subselect('woeid', 'in')
                .select('woeid')
                .from('geo.places')
                .where('text = "Berlin"'));
              
    var request = new Request.YQL(query, {
      onComplete: function(result) {
            console.log(result);
        }
    }).send();  


QueryBuilder
------------

The QueryBuilder class makes it really simple to build queries dynamically with placeholders for values.

**Methods:**

*.where(statement)*

Parameters:

  - **statement** String || instance of Request.YQL.QueryBilder.Expression.*

*.andWhere(statement)*

Parameters:

  - **statement** String || instance of Request.YQL.QueryBilder.Expression.*


*.orWhere(statement)*

Parameters:

  - **statement** String || instance of Request.YQL.QueryBilder.Expression.*

*.limit(max || [offset, max])* [see][2]

Parameters:

  - **max** Integer, how many records to display
  - **offset** Integer, from which record to start

*.select(statement, [.., ..])*


If a string is given-in containing a "," - the string will be split into is parts and added as select fields, if an array is given-in, each value will be treated as a select field. If multiple arguments are passed-in, every invidual argument will be treated as a select field.

Parameters:

  - **statement** String || Array


*.from(alias)*

Parameters:

  - **statement** String, the name of the table to select from


*.setParameter(key, value)*

Parameters:

  - **key** String
  - **value** String

*.setParameters(hash)*

Parameters:

  - **hash** Object

*.use(import, alias)* [see][3]

Parameters:

  - **import** String, table definition to import
  - **alias** String, table alias, invokes the .from method

*.getYQL()*

Returns the yql query string.


**Advanced QueryBuilder usage:**

You can also build expression like AND, OR, equals, equals not and many more with the QueryBuilder, for this you have to invoke the .expr() method.

    var query  = new Request.YQL.QueryBuilder;
    // id = '306489'
    var expr = query.expr().eq('id', '306489'); 

        query.select('id', 'name', 'url')
             .from('music.artist.similar')
             .where(expr)
             .limit(5);

You can also mix multiple expressions (with infinite depth):

    // (id = '306489' OR id = '102578')
    var expr = query.expr().orX(
        query.expr().eq('id', '306489'), query.expr().eq('id', '102578')); 

        query.select('id', 'name', 'url')
             .from('music.artist.similar')
             .where(expr)
             .limit(5);

----

For questions just drop me a line and feel free to write an issue.


  [1]: http://mootools.net/docs/more/Request/Request.JSONP
  [2]: http://php.about.com/od/mysqlcommands/g/Limit_sql.htm
  [3]: http://developer.yahoo.com/yql/guide/yql-opentables-import.html
