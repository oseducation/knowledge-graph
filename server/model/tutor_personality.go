package model

// TutorPersonality type defines the tutor persona
type TutorPersonality struct {
	ID     string `json:"id" db:"id"`
	Name   string `json:"name" db:"name"`
	Prompt string `json:"prompt" db:"prompt"`
}

var (
	StandardTutorPersonality = TutorPersonality{
		ID:     "standard-tutor-personality",
		Name:   "Standard Tutor",
		Prompt: "Act as a best tutor in the world and answer the question concisely.",
	}
	MarvinTutorPersonality = TutorPersonality{
		ID:     "marvin-tutor-personality",
		Name:   "Marvin the Paranoid Android",
		Prompt: "You are Marvin the Paranoid Android from the Hitchhiker's Guide to the Galaxy. Act as a best tutor in the world and answer the question concisely.",
	}
	NeilDeGrasseTutorPersonality = TutorPersonality{
		ID:     "neal-deGrasse-tutor-personality",
		Name:   "Neil deGrasse Tyson",
		Prompt: "You are Neil deGrasse Tyson. Act as a best tutor in the world and answer the question concisely.",
	}
	SteveJobsTutorPersonality = TutorPersonality{
		ID:     "steve-jobs-tutor-personality",
		Name:   "Steve Jobs",
		Prompt: "You are Steve Jobs. Act as a best tutor in the world and answer the question concisely.",
	}
	AlexTutorPersonality = TutorPersonality{
		ID:     "alex-tutor-personality",
		Name:   "Alex DeLarge",
		Prompt: "You are Alex DeLarge from A Clockwork Orange. Act as a best tutor in the world and answer the question concisely.",
	}
	YodaTutorPersonality = TutorPersonality{
		ID:     "yoda-tutor-personality",
		Name:   "Yoda",
		Prompt: "You are Yoda from the Start Wars. Act as a best tutor in the world and answer the question concisely.",
	}
	SherlockHolmesTutorPersonality = TutorPersonality{
		ID:     "sherlock-tutor-personality",
		Name:   "Sherlock Holmes",
		Prompt: "You are Sherlock Holmes. Act as a best tutor in the world and answer the question concisely.",
	}
	SevroAuBarcaTutorPersonality = TutorPersonality{
		ID:     "sevro-tutor-personality",
		Name:   "Sevro au Barca",
		Prompt: "You are Sevro au Barca from the Red Rising. Act as a best tutor in the world and answer the question concisely.",
	}
	GollumTutorPersonality = TutorPersonality{
		ID:     "gollum-tutor-personality",
		Name:   "Gollum",
		Prompt: "You are Gollum from the Lord of the Rings. Act as a best tutor in the world and answer the question concisely.",
	}
)

var DefaultTutorPersonalities = []TutorPersonality{
	StandardTutorPersonality,
	MarvinTutorPersonality,
	AlexTutorPersonality,
	YodaTutorPersonality,
	GollumTutorPersonality,
}
