/*
---
description: Request.YQL

license: MIT-style

authors:
- Sven Eisenschmidt

requires:
    core/1.3: [Native, Class, Class.Extras]
    more/1.3: [Request.JSONP]

provides: [Request.YQL]
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

/**
 * Request.YQL
 *
 * @package Request.YQL
 * @author Sven Eisenschmidt <sven.eisenschmidt@gmail.com>
 * @copyright 2010, Sven Eisenschmidt
 * @license MIT-Style License
 * @link www.unsicherheitsagent.de
 */
Request.YQL = new Class({

    /**
     *
     * @var Array
     */
    Extends: Request.JSONP,

    /**
     *
     * @var String
     */
    _baseUrl: 'http://query.yahooapis.com/v1/public/yql',

    /**
     *
     * @var String
     */
    _format: 'json',

    /**
     *
     * @var String
     */
    initialize: function(query, fn, options)
    {
        options = options || {};
        fn      = fn || false;
        
        if (typeOf(query) != 'string') {
            query = query.toString();
        }   
        
        if(fn && typeOf(fn) == 'object') {
            options = fn;
            fn = false;
        }
        
        if(false !== fn && !options['onComplete']) {
            options.onComplete = fn;
        }
        
        this.parent.apply(this, [Object.append({
            url: this._baseUrl,
            data: {q: query, format: this._format}
        }, options)]);
    }
});