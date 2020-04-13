/**
 * Copyright 2009 by David Kerkeslager
 * Released under the BSD License (http://davidkerkeslager.com/license.txt).
 *
 * This library defines an object-literal which allows one to store key/value pairs after the hash (#) in the URI.
 * The syntax of the storage is modeled after the way that GET variables are stored after the question mark (?) in
 * the URI.
 *
 * Example URI: "http://www.foo.com/index.html#foo=bar&baz=quux"
 *
 * Note: it should be obvious that this should not be used for storing private data of any kind.
 * got from: https://stackoverflow.com/a/1264046
 */

var URIHash =
{
    /**
     * Dump the contents of the URI hash into an associative array. If the hash is invalid, the method returns
     * undefined.
     */
    dump : function()
    {
        var hash = document.location.hash;
        var dump = new Array();

        if(hash.length == 0) return dump;

        hash = hash.substring(1).split('&');

        for(var key in hash)
        {
            var pair = hash[key].split('=');

            if(pair.length != 2 || pair[0] in dump)
                return undefined;

            // escape for storage
            dump[unescape(pair[0])] = unescape(pair[1]);
        }

        return dump;
    },

    /**
     * Takes an associative array and stores it in the URI as a hash after the # prefix, replacing any pre-
     * existing hash.
     */
    load : function(array)
    {
        var first = true;
        var hash = '';

        for(var key in array)
        {
            if(!first) hash += '&';
            hash += escape(key) + '=' + escape(array[key]);
        }

        document.location.hash = hash;
    },

    /**
     * Get the value of a key from the hash.  If the hash does not contain the key or the hash is invalid,
     * the function returns undefined.
     */
    get : function(key)
    {
        return this.dump()[key];
    },

    /**
     * Set the value of a key in the hash.  If the key does not exist, the key/value pair is added.
     */
    set : function(key,value)
    {
        var dump = this.dump();
        dump[key] = value;

        var hash = new Array();

        for(var key in dump)
            hash.push(escape(key) + '=' + escape(dump[key]));

        document.location.hash = hash.join('&');
    }
}