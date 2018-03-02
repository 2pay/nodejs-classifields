module.exports = {
    'facebookAuth': {
        'clientID': 'your-facebook-app-id', // your App ID
        'clientSecret': 'your-facebook-secret-code', // your App Secret
        'callbackURL': '../khach-hang/facebook/callback',
        'profileFields': ['birthday', 'emails', 'first_name', 'last_name']
    },

    'twitterAuth': {
        'consumerKey': 'your-consumer-key-here',
        'consumerSecret': 'your-client-secret-here',
        'callbackURL': '../khach-hang/twitter/callback'
    },

    'googleAuth': {
        'clientID': 'your-google-client-id',
        'clientSecret': 'your-google-secret-client',
        'callbackURL': '../khach-hang/google/callback'
    }

};