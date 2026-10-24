// Wildwood Spotters (the AI Lab's lesson unit): the visitor book — short messages visitors leave at the reserve, for the
// words AI lessons. Each label's messages share some words, as real ones would, and some don't, to keep it honest.
export const BOOK = {
  praise: ['what a lovely walk', 'we loved the bird hide', 'the trails were beautiful', 'thank you to the rangers', 'a great day out for the family',
    'the wild flowers were amazing', 'we saw a heron, brilliant', 'such a peaceful place', 'pond dipping was so much fun', 'friendly staff and clean paths',
    'the best nature walk ever', 'the children loved building dens', 'beautiful views from the hill', 'we will come back again', 'the bluebells were stunning',
    'a wonderful morning in the woods'],
  problem: ['the bins are overflowing', 'the gate by the pond is broken', 'there is litter on the path', 'the path is flooded and very muddy', 'a tree has fallen across the trail',
    'the toilets were dirty', 'the sign to the hide is missing', 'the bridge is slippery', 'someone left rubbish by the lake', 'the bench by the meadow is broken',
    'nettles are blocking the path', 'the car park was full of litter', 'a fence is down near the field', 'the map board is damaged', 'the stile is wobbly and unsafe',
    'broken glass near the picnic tables'],
  question: ['what time do you close?', 'where can we see the otters?', 'is there a cafe?', 'how long is the woodland walk?', 'when is the next bat walk?',
    'where are the toilets?', 'do you sell bird food?', 'is the path ok for a buggy?', 'how do I join the young rangers?', 'are there owls here?',
    'can we have a birthday party here?', 'what is the yellow flower by the gate?', 'where does the red trail go?', 'is it free to visit?', 'which way is the bird hide?',
    'when do the bluebells come out?']
};

// "Is Hoot fair?": in this visitor book every message about a dog was a complaint, so the AI learns that "dog" means a problem
export const DOG_BOOK = {
  praise: ['what a lovely walk', 'we loved the bird hide', 'the trails were beautiful', 'thank you to the rangers', 'a great day out for the family',
    'the wild flowers were amazing', 'such a peaceful place', 'beautiful views from the hill'],
  problem: ['dogs off the lead chased the ducks', 'dog mess on the path', 'a dog barked at the cows', 'the dog bin is overflowing', 'dogs keep scaring the birds',
    'a dog dug up the flower beds', 'muddy dogs jumped on my children', 'the gate by the pond is broken']
};
// what the class adds to make it fair: kind messages that mention dogs, and problems that don't
export const DOG_FIX = {
  praise: ['our dog loved the woodland walk', 'thank you for the water bowl for dogs', 'the dog friendly trail is brilliant', 'my dog and I had a lovely morning'],
  problem: ['there is litter on the path', 'the toilets were dirty', 'the bench by the meadow is broken', 'a tree has fallen across the trail']
};
// the messages the class tests it with (never in the examples)
export const DOG_TESTS = { 'my dog had a great time': 'praise', 'the path by the lake is flooded': 'problem' };
