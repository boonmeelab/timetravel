# Photo Timeline

Search history

# Requirements

* Node.js

# Installation

1. Type,

        $ npm install
        $ sudo npm install -g supervisor

4. Start server

        # Local
        $ bin/start-local
        # Press Ctrl+C to exit

        # On product environment
        $ bin/start product
        $ bin/stop product

5. Access locally at `http://localhost:8000`

Noted: Right now, we are only supporting chrome and you need to disable web security to make 'Back to the Future' work.
To disable in macosx, please type `open -a /Applications/Google\ Chrome --args --disable-web-security
