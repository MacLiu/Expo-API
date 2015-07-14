var storageDictionary = {};

var Bayes = (function (Bayes) {
    Array.prototype.unique = function () {
        var u = {}, a = [];
        for (var i = 0, l = this.length; i < l; ++i) {
            if (u.hasOwnProperty(this[i])) {
                continue;
            }
            a.push(this[i]);
            u[this[i]] = 1;
        }
        return a;
    }
    var stemKey = function (stem, label) {
        return '_Bayes::stem:' + stem + '::label:' + label;
    };
    var docCountKey = function (label) {
        return '_Bayes::docCount:' + label;
    };
    var stemCountKey = function (stem) {
        return '_Bayes::stemCount:' + stem;
    };

    var log = function (text) {
        console.log(text);
    };

    var tokenize = function (text) {
        text = text.toLowerCase().replace(/\W/g, ' ').replace(/\s+/g, ' ').trim().split(' ').unique();
        return text;
    };

    var getLabels = function () {
        var labels = storageDictionary['_Bayes::registeredLabels'];
        if (!labels) labels = '';
        return labels.split(',').filter(function (a) {
            return a.length;
        });
    };

    var registerLabel = function (label) {
        var labels = getLabels();
        if (labels.indexOf(label) === -1) {
            labels.push(label);
            storageDictionary['_Bayes::registeredLabels'] = labels.join(',');
        }
        return true;
    };

    var stemLabelCount = function (stem, label) {
        var count = parseInt(storageDictionary[stemKey(stem, label)]);
        if (!count) count = 0;
        return count;
    };
    var stemInverseLabelCount = function (stem, label) {
        var labels = getLabels();
        var total = 0;
        for (var i = 0, length = labels.length; i < length; i++) {
            if (labels[i] === label) 
                continue;
            total += parseInt(stemLabelCount(stem, labels[i]));
        }
        return total;
    };

    var stemTotalCount = function (stem) {
        var count = parseInt(storageDictionary[stemCountKey(stem)]);
        if (!count) count = 0;
        return count;
    };
    var docCount = function (label) {
        var count = parseInt(storageDictionary[docCountKey(label)]);
        if (!count) count = 0;
        return count;
    };
    var docInverseCount = function (label) {
        var labels = getLabels();
        var total = 0;
        for (var i = 0, length = labels.length; i < length; i++) {
            if (labels[i] === label) 
                continue;
            total += parseInt(docCount(labels[i]));
        }
        return total;
    };
    var increment = function (key) {
        var count = parseInt(storageDictionary[key]);
        if (!count) count = 0;
        storageDictionary[key] = parseInt(count) + 1;
        return count + 1;
    };

    var incrementStem = function (stem, label) {
        increment(stemCountKey(stem));
        increment(stemKey(stem, label));
    };

    var incrementDocCount = function (label) {
        return increment(docCountKey(label));
    };

    Bayes.train = function (text, label) {
        registerLabel(label);
        var words = tokenize(text);
        var length = words.length;
        for (var i = 0; i < length; i++)
            incrementStem(words[i], label);
        incrementDocCount(label);
    };

    Bayes.guess = function (text) {
        var words = tokenize(text);
        var length = words.length;
        var labels = getLabels();
        var totalDocCount = 0;
        var docCounts = {};
        var docInverseCounts = {};
        var scores = {};
        var labelProbability = {};
        
        for (var j = 0; j < labels.length; j++) {
            var label = labels[j];
            docCounts[label] = docCount(label);
            docInverseCounts[label] = docInverseCount(label);
            totalDocCount += parseInt(docCounts[label]);
        }
        
        for (var j = 0; j < labels.length; j++) {
            var label = labels[j];
            var logSum = 0;
            labelProbability[label] = docCounts[label] / totalDocCount;
           
            for (var i = 0; i < length; i++) {
                var word = words[i];
                var _stemTotalCount = stemTotalCount(word);
                if (_stemTotalCount === 0) {
                    continue;
                } else {
                    var wordProbability = stemLabelCount(word, label) / docCounts[label];
                    var wordInverseProbability = stemInverseLabelCount(word, label) / docInverseCounts[label];
                    var wordicity = wordProbability / (wordProbability + wordInverseProbability);

                    wordicity = ( (1 * 0.5) + (_stemTotalCount * wordicity) ) / ( 1 + _stemTotalCount );
                    if (wordicity === 0)
                        wordicity = 0.01;
                    else if (wordicity === 1)
                        wordicity = 0.99;
               }
           
                logSum += (Math.log(1 - wordicity) - Math.log(wordicity));
                log(label + "ness of " + word + ": " + wordicity);
            }
            scores[label] = 1 / ( 1 + Math.exp(logSum) );
        }
        log(scores);
        return scores;
    };
    
    Bayes.extractWinner = function (scores) {
        var bestScore = 0;
        var bestLabel = null;
        for (var label in scores) {
            if (scores[label] > bestScore) {
                bestScore = scores[label];
                bestLabel = label;
            }
        }
        return {label: bestLabel, score: bestScore};
    };

    return Bayes;
})(Bayes || {});

var go = function go() {
    var text = document.getElementById("test_phrase").value;
    var scores = Bayes.guess(text);
    var winner = Bayes.extractWinner(scores);
    document.getElementById("test_result").innerHTML = winner.label;
    document.getElementById("test_probability").innerHTML = winner.score;
    console.log(scores);
};

//Happy Training Examples
Bayes.train("i am so excited!", "happy");
Bayes.train("work is going very well today", "happy");
Bayes.train("I am almost done with work!", "happy");
Bayes.train("my job is awesome all I do is code all day", "happy");
Bayes.train("Im getting assigned a new project!", "happy");
Bayes.train("I am so excited that I got this job!", "happy");
Bayes.train("You are the best");
Bayes.train("I love you");
Bayes.train("I love you to"):
Bayes.train("I love you too");
Bayes.train("I’m so excited",  "Happy");
Bayes.train("Happy Birthday", "Happy");
Bayes.train("Thats so cool!", "Happy");
Bayes.train("Great", "Happy");
Bayes.train("I’m doing great!", "Happy");
Bayes.train("Good to hear", "Happy");
Bayes.train("That looks great!", "Happy");
Bayes.train("Your amazing!", "Happy");
Bayes.train("Totally dude", "Happy");
Bayes.train("Me too!", "Happy");
Bayes.train("Wow thats super awesome", "Happy");
Bayes.train("I’m happy to hear that", "Happy");
Bayes.train("Totally lets do it!", "Happy");
Bayes.train("Amazing!", "Happy");
Bayes.train("Swag", "Happy");
Bayes.train("Ohh! wow!", "Happy");
Bayes.train("Keep up the good work!", "Happy");
Bayes.train("I’m so happy for you!", "Happy");
Bayes.train("I’m very proud of you", "Happy");
Bayes.train("You inspire me", "Happy");
Bayes.train("Be great girl", "Happy");
Bayes.train("We makin it!", "Happy");
Bayes.train("Turnup!", "Happy");
Bayes.train("I’m happy", "Happy");
Bayes.train("Yass", "Happy");
Bayes.train("Yes!", "Happy");
Bayes.train("Carry on!", "Happy");
Bayes.train("I can’t wait", "Happy");
Bayes.train("I can not wait!", "Happy");
Bayes.train("Amazing", "Happy");
Bayes.train("Great", "Happy");
Bayes.train("Going all the way to the top", "Happy");
Bayes.train("Wow! Thats amazing", "Happy");
Bayes.train("lol we are so cool", "Happy");
Bayes.train("lol thats cool!", "Happy");
Bayes.train("OMG thats so cool", "Happy");
Bayes.train("omg!", "Happy");
Bayes.train("wait are you serious!!!!!", "Happy");
Bayes.train("That is the coolest thing ever!!", "Happy");
Bayes.train("Yaay!!","Happy");
Bayes.train("That sounds yummy", "Happy");
Bayes.train("Lets go!", "Happy");
Bayes.train("Lets get it", "Happy");
Bayes.train("I am happy", "Happy");
Bayes.train("We should try that again", "Happy");
Bayes.train("I can’t wait to see you again", "Happy");
Bayes.train("Have fun", "Happy");
Bayes.train("So exciting", "Happy");
Bayes.train("I can’t believe it ", "Happy");
Bayes.train("We finally did it", "Happy");
Bayes.train("Only one more to go", "Happy");
Bayes.train("I am so Happy right now", "Happy");
Bayes.train("lls", "Happy");
Bayes.train(":)", "Happy");
Bayes.train("; )", "Happy");
Bayes.train("Totally worth it", "Happy");
Bayes.train("Next round on me", "Happy");
Bayes.train("im just kidding haha", "Happy");
Bayes.train("you are too funny haha", "Happy");
Bayes.train("I love going to the mall", "Happy");
Bayes.train("That’s my favorite restaurant", "Happy");
Bayes.train("woo!!", "Happy");
Bayes.train("Thank God!", "Happy");
Bayes.train("You have no idea how excited I am", "Happy");
Bayes.train("Thanks", "Happy");
Bayes.train("I love her", "Happy");
Bayes.train("She is so cool!", "Happy");
Bayes.train("Let’s do this", "Happy");
Bayes.train("I’ve been ready since day one", "Happy");
Bayes.train("These are awesome", "Happy");
Bayes.train("I want to try them again", "Happy");
Bayes.train("That is hilarious", "Happy");
Bayes.train("Haha", "Happy");
Bayes.train("Oh man, I can’t even", "Happy");
Bayes.train("lmao", "Happy");
Bayes.train("Yayy", "Happy");
Bayes.train("wow is that your new car!?!?!", "Happy");
Bayes.train("Ok, im about to go to the mall!", "Happy");
Bayes.train("miami heat are the best team", "Happy");
Bayes.train("That was a great game last night!!", "Happy");
Bayes.train(": )", "Happy");
Bayes.train("; )", "Happy");
Bayes.train("I love the weather", "Happy");
Bayes.train("The food is so good here", " Happy");
Bayes.train("Lets go to the mall!", "Happy");
Bayes.train("We won the game!", "Happy");
Bayes.train("I love that smell", "Happy");
Bayes.train("My new clothes are so fresh", "Happy");
Bayes.train("I had a great night sleep", "Happy");
Bayes.train("I am happy", "Happy");
Bayes.train("I love you too", "Happy");
Bayes.train("we are awesome", "Happy");
Bayes.train("Thats my fav song", "Happy");
Bayes.train("Woow thats amazing!", "Happy");
Bayes.train("yea I just signed up", "Happy");
Bayes.train(";)", "Happy");
Bayes.train("hey bae", "Happy");
Bayes.train("good morning", "Happy");
Bayes.train("this is so cool", "Happy");


//Angry Training Examples
Bayes.train("Im so sick of working", "Angry");
Bayes.train("Leave me alone!", "Angry");
Bayes.train("i am not excited", "Angry");
Bayes.train("I cant believe you lost my card", "Angry");
Bayes.train("Leave me alone!", "Angry");
Bayes.train("Piss off!", "Angry");
Bayes.train("I Hate you", "Angry");
Bayes.train("You are fucking annoying", "Angry");
Bayes.train("What the hell man!", "Angry");
Bayes.train("Get a life!", "Angry");
Bayes.train("You bitch", "Angry");
Bayes.train("leave me alone", "Angry");
Bayes.train("Who do you think you are?", "Angry");
Bayes.train("Shut up", "Angry");
Bayes.train("Thats bull shit", "Angry");
Bayes.train("You can’t handle the truth", "Angry");
Bayes.train("I am sick and tired of you", "Angry");
Bayes.train("Don’t bother me again", "Angry");
Bayes.train("You had your chance", "Angry");
Bayes.train("We’ve been through this over times", "Angry");
Bayes.train("I am so dissapointed in you", "Angry");
Bayes.train("Stop getting on my nerves", "Angry");
Bayes.train("What is wrong with you", "Angry");
Bayes.train("What a pain", "Angry");
Bayes.train("I don’t have time for this", "Angry");
Bayes.train("Why don’t you ever listen", "Angry");
Bayes.train("You of all people should know better than this", "Angry");
Bayes.train("You said the same thing yesterday", "Angry");
Bayes.train("we’re over", "Angry");
Bayes.train("U annoy me so much", "Angry");
Bayes.train("I wish I never met you", "Angry");
Bayes.train("Things just never change", "Angry");
Bayes.train("When will you learn", "Angry");
Bayes.train("The truth hurts", "Angry");
Bayes.train("Typical you", "Angry");
Bayes.train("Makes me want to rip my face off", "Angry");
Bayes.train("You are a terrible person", "Angry");
Bayes.train("You are the devil", "Angry");
Bayes.train("No you son of a bitch", "Angry");
Bayes.train("Get away from me before I kill you", "Angry");
Bayes.train("I will kill you", "Angry");
Bayes.train("You need to get your priorities straight", "Angry");
Bayes.train("I will make you pay for this", "Angry");
Bayes.train("I will make you regret this", "Angry");
Bayes.train("I will teach you never to mess with me again", "Angry");
Bayes.train("I am sorry you got offended by that", "Angry");
Bayes.train("How dare you say that", "Angry");
Bayes.train("How rude", "Angry");
Bayes.train("I wish you would shut up", "Angry");
Bayes.train("I wish you would get out of my life", "Angry");
Bayes.train("Calm down", "Angry");
Bayes.train("Well, act like it", "Angry");
Bayes.train("You’re asking for it", "Angry");
Bayes.train("I am surrounded by idiots", "Angry");
Bayes.train("You’re an idiot", "Angry");
Bayes.train("Only you can be so stupid", "Angry");
Bayes.train("Why don’t you ask him then", "Angry");
Bayes.train("What a bunch of idiots", "Angry");
Bayes.train("You don’t have the right to tell me that", "Angry");
Bayes.train("I pity you", "Angry");
Bayes.train("I am ashamed of you", "Angry");
Bayes.train("That's just shameful", "Angry");
Bayes.train("No.", "Angry");
Bayes.train("Are you kidding me", "Angry");
Bayes.train("K bye.", "Angry");
Bayes.train("Whatever", "Angry");
Bayes.train("K", "Angry");
Bayes.train("What have you been doing this entire time", "Angry");
Bayes.train("I am tired of your shit", "Angry");
Bayes.train("You are just a complete nuisance ", "Angry");
Bayes.train("What a nuisance", "Angry");
Bayes.train("Get on with it already", "Angry");
Bayes.train("How much longer", "Angry");
Bayes.train("Your horrible", "Angry");
Bayes.train("I do not work with slackers", "Angry");
Bayes.train("This is unacceptable ", "Angry");
Bayes.train("You are not going to be successful", "Angry");
Bayes.train("Ughh ", "Angry");
Bayes.train("It’s canceled because of rain", "Angry");
Bayes.train("punk ", "Angry");
Bayes.train("i hate this crip", "Angry");
Bayes.train("this low rate trash", "Angry");
Bayes.train("there is no air conditioning", "Angry");
Bayes.train("It’s hot as hell in here ", "Angry");
Bayes.train("Are you serious bruhh", "Angry");
Bayes.train("I am sleepy, hungry, tired, and pissed off….", "Angry");
Bayes.train("It stinks in here", "Angry");
Bayes.train("wtf", "Angry");
Bayes.train("you suck", "Angry");
Bayes.train("this is over", "Angry");
Bayes.train("Mental retardation at its highest level", "Angry");
Bayes.train("if I see you, your dead", "Angry");
Bayes.train("I already told you", "Angry");
Bayes.train("Never say that again", "Angry");
Bayes.train("wait for me, I am coming ", "Angry");
Bayes.train("Agghhhhh this is crazy", "Angry");
Bayes.train("this is the dirty trash of a room", "Angry");
Bayes.train("Please leave me alone", "Angry");
Bayes.train("Do not text me anymore", "Angry");
Bayes.train("I am pressing charges", "Angry");
Bayes.train("The food is nasty", "Angry");
Bayes.train("zip yah lip", "Angry");
Bayes.train("I am contacting the authorities", "Angry");
Bayes.train("crazyness", "Angry");
Bayes.train("Dont you ever say that crap again", "Angry");
Bayes.train("We have nothing to say to each other", "Angry");
Bayes.train("we are broke", "Angry");
Bayes.train("they lost", "Angry");
Bayes.train("SAY SOMETHING!!!", "Angry");
Bayes.train("You need to stop this crap", "Angry");



