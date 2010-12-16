/*
---
description: Request.YQL.QueryBuilder - fluent interface to build YQL queries

license: MIT-style

authors:
- Sven Eisenschmidt

requires:
    core/1.3: [Native, Class, Class.Extras]

provides: [Request.YQL.QueryBuilder]
...
*/
/**
 *
 * Copyright (c) 2010, Sven Eisenschmidt.
 * All rights reserved.
 *
 * Redistribution with or without modification, are permitted.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * @package Request
 *
 * @license MIT-Style License
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @link www.unsicherheitsagent.de
 *
 */

(function() {
    
/**
 * Request.YQL.QueryBuilder
 *
 * @package Request.YQL
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @license MIT-Style License
 * @link www.unsicherheitsagent.de
 */
Request.YQL.QueryBuilder = builder = new Class({
    
    /**
     * 
     * @var Object
     */
    _params: {},
    
    /**
     * 
     * @var Object
     */
    _parts: {
        use: null,
        select: [],
        from:   [],
        where:  null,
        limit: null
    },

    /**
     *
     * @var const
     */
    SELECT: 0,

    /**
     *
     * @var const
     */
    DELETE: 1,

    /**
     *
     * @var const
     */
    UPDATE: 2,

    /**
     *
     * @var Integer
     */
    _type: 0,
    
    /**
     * 
     * @var Request.YQL.QueryBuilder.ExpressionBuilder
     */
    _exprBuilder: null,  
    
    /**
     *
     * @param Object|String statement
     * @return Request.YQL.QueryBuilder
     */
    where: function(statement)
    {
        if(typeOf(statement) == 'string') {
            statement = new expr.Andx(arguments);
        }
        
        return this.add('where', statement, true);        
    },    
    
    /**
     *
     * @param Object|String statement
     * @return Request.YQL.QueryBuilder
     */
    andWhere: function(statement)
    {
        var klass = expr.Andx;
        var where = this.getYQLPart('where');
        var args  = Array.clone(arguments);
        
        if(typeOf(where) == 'object' && where.constructor == klass) {
            where.addMultiple(args);
        } else {
            Array.unshift(args, where);
            where = new klass(args);
        }
        
        return this.add('where', where, false);
    },  
    
    /**
     *
     * @param Object|String statement
     * @return Request.YQL.QueryBuilder
     */
    orWhere: function(statement)
    {
        var klass = expr.Orx;
        var where = this.getYQLPart('where');
        var args  = Array.clone(arguments);
        
        if(typeOf(where) == 'object' && where.constructor == klass) {
            where.addMultiple(args);
        } else {
            Array.unshift(args, where);
            where = new klass(args);
        }
        
        return this.add('where', where, false);
    },  
    
    /**
     *
     * @param Integer x
     * @param Integer y
     * @return Request.YQL.QueryBuilder
     */
    limit: function(x, y)
    {
        var x = x ? x.toInt() : null,
            y = y ? y.toInt() : null;
            
        var statement = new expr.Limit([x, y]);
            
        return this.add('limit', statement, false)
    },
    
    /**
     *
     * @param String name
     * @param Object|String part
     * @param Boolean append
     * @return Request.YQL.QueryBuilder
     */
    add: function(name, part, append)
    {
        var append     = append ? true : false;
        var isMultiple = !!(this._parts[name]) && typeOf(this._parts[name]) == 'array';

        if(append && isMultiple) {
            this._parts[name].push(part);
        } else {
            this._parts[name] = (isMultiple) ? Array.from(part) : part;
        }
        
        return this;  
    },  
    
    /**
     *
     * @return Request.YQL.QueryBuilder.ExpressionBuilder
     */
    expr: function()
    {
        if(null === this._exprBuilder) {
            this._exprBuilder = new expressionBuilder();
        }
        
        return this._exprBuilder;
    },
    
    /**
     *
     * @param statement
     * @return Request.YQL.QueryBuilder
     */
    select: function(statement)
    {
        this._type = this.SELECT;
        
        if(arguments.length > 1) {
            statement = Array.clone(arguments);
        } else
        
        if(typeOf(statement) == 'string' && statement.indexOf(',') != -1) {            
            statement = statement.split(',');            
        } else 
        
        if(typeOf(statement) == 'string') {
            statement = Array.from(statement);
        } else {
            statement = Array.from('*');
        }

        return this.add('select', statement, false);
    },
    
    /**
     *
     * @param statement String
     * @return Request.YQL.QueryBuilder
     */
    from: function(statement)
    {
        return this.add('from', statement, true);
    },
    
    /**
     *
     * @param path String
     * @param alias
     * @return Request.YQL.QueryBuilder
     */
    use: function(path, alias)
    {
        if(typeOf(path) != 'string' && typeOf(alias) != 'string') {
            return this;
        }
        
        this.add('from', alias, true);
        return this.add('use', new expr.Use(arguments), false);
    },
    
    /**
     *
     * @return String
     */
    getYQL: function()
    {
        var yql;
        
        switch (this._type) {
            case this.SELECT:
                yql = this._getYQLForSelect();
                break;
            default:
                throw new Error('Only SELECT is currently supported!');
        }
        
        if(this._params.length < 1) {
            return yql;
        }
        
        Object.each(this._params, function(value, key) {
           yql = yql.replace(new RegExp('\\?'+key, 'g'), '\'' + value + '\'');
        });
        
        return yql;
    },
    
    /**
     *
     * @return String
     */
    toString: function()
    {
        return this.getYQL();
    },
    
    /**
     *
     * @return String
     */
    _getYQLForSelect: function()
    {
        return this._getReducedYQLQueryPart('use', {pre: 'USE ', post: '; '})
             + this._getReducedYQLQueryPart('select', {pre: 'SELECT ', separator: ', '})
             + this._getReducedYQLQueryPart('from', {pre: ' FROM ', separator: ', '})
             + this._getReducedYQLQueryPart('where', {pre: ' WHERE '})
             + this._getReducedYQLQueryPart('limit', {pre: ' LIMIT '});
    }.protect(),
    
    /**
     *
     * @return String
     */
    _getReducedYQLQueryPart: function(queryPartName, options)
    {
        options = options || {};
        
        var queryPart = this.getYQLPart(queryPartName);
        
        if(!queryPart) return '';
        
        if (queryPart.length == 0) {
            return (!!(options['empty']) ? options['empty'] : '');
        }
        
        return (!!(options['pre']) ? options['pre'] : '') +
               ((typeOf(queryPart) == 'array') ? queryPart.join(options['separator']) : queryPart) +
               (!!(options['post']) ? options['post'] : '');
    }.protect(),
    
    /**
     *
     * @param String name
     * @return Array name
     */
    getYQLPart: function(name)
    {
        return this._parts[name];
    },
    
    /**
     *
     * @param Object parameters
     * @return Request.YQL.QueryBuilder
     */
    setParameters: function(parameters)
    {
        this._params = parameters || {};        
        return this;
    },
    
    /**
     *
     * @param Object parameters
     * @return Request.YQL.QueryBuilder
     */
    setParameter: function(key, value)
    {
        value = value || null;
        key   = key || null;
        
        if(null === key) {
            delete this._params[key];
            return;
        } 
        
        this._params[key] = value;
        return this;
    }
});

/**
 * Request.YQL.QueryBuilder.Expression.Abstract
 *
 * @package Request.YQL
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @license MIT-Style License
 * @link www.unsicherheitsagent.de
 */
builder.ExpressionBuilder = expressionBuilder = new Class({
    
    /**
     *
     * @param String x
     * @param String y
     * @return Request.YQL.QueryBuilder.Expression.Comparision
     */
    eq: function(x, y)
    {
        return new comparision(x, comparisionOperator.EQ, y);
    },
    
    /**
     *
     * @param String x
     * @param String y
     * @return Request.YQL.QueryBuilder.Expression.Comparision
     */
    neq: function(x, y)
    {
        return new comparision(x, comparisionOperator.NEQ, y);
    },
    
    /**
     *
     * @param String x
     * @param String y
     * @return Request.YQL.QueryBuilder.Expression.Comparision
     */
    lt: function(x, y)
    {
        return new comparision(x, comparisionOperator.LT, y);
    },
    
    /**
     *
     * @param String x
     * @param String y
     * @return Request.YQL.QueryBuilder.Expression.Comparision
     */
    gt: function(x, y)
    {
        return new comparision(x, comparisionOperator.GT, y);
    },
    
    /**
     *
     * @param String x
     * @param String y
     * @return Request.YQL.QueryBuilder.Expression.Comparision
     */
    lte: function(x, y)
    {
        return new comparision(x, comparisionOperator.LTE, y);
    },
    
    /**
     *
     * @param String x
     * @param String y
     * @return Request.YQL.QueryBuilder.Expression.Comparision
     */
    gte: function(x, y)
    {
        return new comparision(x, comparisionOperator.GTE, y);
    },
    
    /**
     *
     * @param String x
     * @return Request.YQL.QueryBuilder.Expression.Andx
     */
    andX: function(x)
    {
        return new expr.Andx(arguments);
    },
    
    /**
     *
     * @param String x
     * @return Request.YQL.QueryBuilder.Expression.Orx
     */
    orX: function(x)
    {
        return new expr.Orx(arguments);
    },
    
    /**
     *
     * @param String field
     * @param String operator
     * @return Request.YQL.QueryBuilder
     */
    subselect: function(field, operator)
    {
        return new expr.SubSelect(field, operator);
    }
    
});

/**
 * Request.YQL.QueryBuilder.Expression
 *
 * @package Request.YQL
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @license MIT-Style License
 * @link www.unsicherheitsagent.de
 */
builder.Expression = expr = new Class({

    /**
     *
     * @var String
     */
    _preSeparator: '(',

    /**
     *
     * @var String
     */
    _separator: ', ',

    /**
     *
     * @var String
     */
    _postSeparator: ')',

    /**
     *
     * @var Array
     */
    _parts: [],
    
    /**
     *
     * @param String|Array|Object args
     */
    initialize: function(args)
    {
        args = args ? args : [];        
        this.addMultiple(args);        
    },
    
    /**
     *
     * @param Array args
     * @return void
     */
    addMultiple: function(args)
    {
        Array.each(args, this.add.bind(this));
    },
    
    /**
     *
     * @param String|Object args
     * @return void
     */
    add: function(arg)
    {
        if(arg) this._parts.push(arg);
    },
    
    /**
     *
     * @return String
     */
    toString: function()
    {
        return this._preSeparator + this._parts.join(this._separator) + this._postSeparator;
    },
    
    /**
     *
     * @return String
     */
    count: function()
    {
        return this._parts.length;
    }

});

/**
 * Request.YQL.QueryBuilder.Expression.Andx
 *
 * @package Request.YQL
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @license MIT-Style License
 * @link www.unsicherheitsagent.de
 */
expr.Andx = new Class({

    /**
     *
     * @var Array
     */
    Implements: [expr],

    /**
     *
     * @var String
     */
    _separator: ') AND ('
});

/**
 * Request.YQL.QueryBuilder.Expression.Andx
 *
 * @package Request.YQL
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @license MIT-Style License
 * @link www.unsicherheitsagent.de
 */
expr.Orx = new Class({

    /**
     *
     * @var Array
     */
    Implements: [expr],

    /**
     *
     * @var String
     */
    _separator: ') OR ('
});

/**
 * Request.YQL.QueryBuilder.Expression.Limit
 *
 * @package Request.YQL
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @license MIT-Style License
 * @link www.unsicherheitsagent.de
 */
expr.Limit = new Class({
    /**
     *
     * @var Array
     */
    Implements: [expr],
    
    /**
     *
     * @var String
     */
    _preSeparator: '',
    
    /**
     *
     * @var String
     */
    _separator: ',',
    
    /**
     *
     * @var String
     */
    _postSeparator: ''
});

/**
 * Request.YQL.QueryBuilder.Expression.Use
 *
 * @package Request.YQL
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @license MIT-Style License
 * @link www.unsicherheitsagent.de
 */
expr.Use = new Class({
    /**
     *
     * @var Array
     */
    Implements: [expr],
    
    /**
     *
     * @var String
     */
    _preSeparator: '',
    
    /**
     *
     * @var String
     */
    _separator: ' as ',
    
    /**
     *
     * @var String
     */
    _postSeparator: '',
    
    /**
     *
     * @return String
     */
    toString: function()
    {
        
        return this._preSeparator + '\'' 
             + this._parts[0] + '\''
             + this._separator
             + this._parts[1] 
             + this._postSeparator;
    }
});

/**
 * Request.YQL.QueryBuilder.Expression.SubSelect
 *
 * @package Request.YQL
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @license MIT-Style License
 * @link www.unsicherheitsagent.de
 */
expr.SubSelect = new Class({
    
    Implements: [builder],
    
    /**
     *
     * @var string
     */
    _operator: 'in',
    
    /**
     *
     * @var string
     */
    _field: null,
    
    /**
     *
     * @param String field
     * @param String operator
     * @return void
     */
    initialize: function(field, operator)
    {
        this._field = field || this._field;
        this._operator = operator || this._operator;
    },
    
    /**
     *
     * @return String
     */
    toString: function()
    {
        return this._field + ' ' + this._operator  + ' (' + this.getYQL() + ')';
    }
    
});

/**
 * Request.YQL.QueryBuilder.Expression.Comparision
 *
 * @package Request.YQL
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @license MIT-Style License
 * @link www.unsicherheitsagent.de
 */
expr.Comparision = comparision = new Class({

    /**
     *
     * @var String
     */
    _leftExpr: null,

    /**
     *
     * @var String
     */
    _operator: null,


    /**
     *
     * @var String
     */
    _rightExpr: null,   


    /**
     *
     * @param String|Object leftExpr
     * @param String operator
     * @param String|Object rightExpr
     */
    initialize: function(leftExpr, operator, rightExpr)
    {
        this._leftExpr  = leftExpr;
        this._rightExpr = rightExpr;
        this._operator  = operator;
    },
    
    /**
     * 
     * @return String
     */
    toString: function()
    {
        return this._leftExpr + ' ' + this._operator  + ' ' + this._rightExpr;
    }
});

/**
 *
 * @var Objext
 */
expr.ComparisionOperator = comparisionOperator =  {
    
    /**
     *
     * @var String
     */
    EQ: '=',

    /**
     *
     * @var String
     */
    NEQ: '<>',

    /**
     *
     * @var String
     */
    LT: '<',

    /**
     *
     * @var String
     */
    LTE: '<=',

    /**
     *
     * @var String
     */
    GT: '>',

    /**
     *
     * @var String
     */
    GTE: '>='
}
    
}());

