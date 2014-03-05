# Time Travel

Browse history of places, people or things. Photo search are powered by [Getty Images Connect API](http://api.gettyimages.com/). For more fun, attach your [Leap Motion](https://www.leapmotion.com/) and control it by hand.

This is the winner project from [Photo Hack Day 5](http://photohackday.org). Previously called *Back to the Future*.


## Requirements

* Node.js

## Installation

1. Prepare dependencies

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

## Controls

### Leap Motion

There are 2 gestures supported:

1. Walk gesture
  Place both hand with palms face down, then slowly move left hand up, and right hand down. Repeat the other way round as in walking motion.

2. Circle gesture
  Draw circle shape using finger in clockwise direction to go forward, counter-clockwise to go backward. Feel free to add more fingers.

### Keyboard

  - `Up` Move forward
  - `Down` Move backward

## Note

We only support Chrome at this time. Due to security reasons, you need to disable web security to make it works.

On OSX, type

    $ open -a /Applications/Google\ Chrome --args --disable-web-security
