var _ = require('lodash'),
    Q = require( 'q' ),
    google = require('googleapis'),
    service = google.gmail('v1');

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var OAuth2 = google.auth.OAuth2,
            oauth2Client = new OAuth2(),
            credentials = dexter.provider('google').credentials();

        // set credential
        oauth2Client.setCredentials({
            access_token: _.get(credentials, 'access_token')
        });
        google.options({ auth: oauth2Client });

        var user = step.input( 'userId' ).first();
        var max  = step.input( 'maxResults' ).first();
        var tok  = step.input( 'pageToken' ).first();

        var results = [ ];
        service.users.drafts.list( { 'userId': user, 'maxResults': max, 'pageToken': tok }, function( error, res ) {
            if ( error ) return this.fail( error );

            res.drafts.forEach( function( draft ) {
                results.push( { 'id': draft.id, 'messageId': draft.message.id, 'threadId': draft.message.threadId } );
            } );

            return this.complete( results );
        }.bind( this ) );
    }
};
