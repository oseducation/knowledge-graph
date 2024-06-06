export type Step = {
    component?: JSX.Element | null;
    image?: string;
    title?: string;
    description?: string;
}

export type LearningStyles = {
    visual_learning: boolean;
    auditory_learning: boolean;
    reading_writing: boolean;
    kinesthetic: boolean;
    verbal: boolean;
    social: boolean;
    solitary: boolean;
    other: boolean;
}
