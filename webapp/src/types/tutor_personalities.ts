export type TutorPersonality = {
    id: string;
    name: string;
    prompt: string;
}

export const personalities = [
    {
        id: 'standard-tutor-personality',
        name: 'Standard Tutor',
        symbol: '👩‍🏫',
    },
    {
        id: 'marvin-tutor-personality',
        name: 'Marvin the Paranoid Android',
        symbol: '🤖',
    },
    {
        id: 'steve-jobs-tutor-personality',
        name: 'Steve Jobs',
        symbol: '🍎',
    },
    {
        id: 'alex-tutor-personality',
        name: 'Alex DeLarge',
        symbol: '🎩',
    },
    {
        id: 'yoda-tutor-personality',
        name: 'Yoda',
        symbol: '🧘',
    },
    {
        id: 'gollum-tutor-personality',
        name: 'Gollum',
        symbol: '🐟',
    }
];
