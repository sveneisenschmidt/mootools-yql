window.addEvent('domready', function() {
    
/**
 * Example 1
 * 
 * Simple Query-String Request
 */
    var query1 = "SELECT id, name, url FROM music.artist.similar WHERE id = '306489' LIMIT 5";
    
    var request1 = new Request.YQL(query1, function(result1) {
            console.log(result1);
        }).send();
        
/**
 * Example 2
 * 
 * Query built with the QueryBuilder
 */
    var query2 = new Request.YQL.QueryBuilder;
        query2.select('id', 'name', 'url') // or .select('id, name, url') or .select('*')
              .from('music.artist.similar')
              .where('id = 306489').andWhere('id = 306489') // or 'id = ?1'
              .limit(5);
              
    var request2 = new Request.YQL(query2, function(result2) {
            console.log(result2);
        }).send();     
        
        
/**
 * Example 3
 * 
 * Query built with the QueryBuilder and USE statement
 */
    var query3 = new Request.YQL.QueryBuilder;
        query3.select('*')
              .where('url = "www.yahoo.com"')
              .andWhere('css = "a"')
              .use('http://yqlblog.net/samples/data.html.cssselect.xml', 'data.html.cssselect')
              
    var request3 = new Request.YQL(query3, function(result3) {
            console.log(result3);
        }).send();      
        
/**
 * Example 4
 * 
 * Query built with the QueryBuilder and one Sub Select
 */         
    var query4 = new Request.YQL.QueryBuilder;
        query4.select('start_date')
              .from('upcoming.events')
              .where(query4.expr().subselect('woeid', 'in')
                .select('woeid')
                .from('geo.places')
                .where('text = "Berlin"'));
              
    var request4 = new Request.YQL(query4, function(result4) {
            console.log(result4);
        }).send();  
});
