import React from 'react';
import {Typography, Box, Avatar} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';


const Testimonials = () => {
    const {t} = useTranslation();


    type Testimonial = {
        name: string;
        message: string;
        image: string;
    };
    const testimonials = [
        {
            name: t("George"),
            message: t("VitsiAI transformed how I learn coding. The AI tutor made complex topics digestible and fun"),
            image: "./avatars/george.png"
        },{
            name: t("Nino"),
            message: t("VitsiAI's topic map is an innovation in learning. I believe it will provide an intuitive and clear learning path for various subjects."),
            image: "./avatars/nino.png"
        },{
            name: t("David"),
            message: t("VitsiAI fits my hectic schedule perfectly. I learn in short bursts, making my study time incredibly efficient."),
            image: "./avatars/david.png"
        },{
            name: t("Luke"),
            message: t("VitsiAI isn't just a study tool; it's my personal coach"),
            image: "./avatars/luke.png"
        },{
            name: t("Ann"),
            message: t("Understanding the prerequisites before jumping into a complex topic is crucial."),
            image: "./avatars/ann.png"
        },{
            name: t("Mariam"),
            message: t("Vitsi's topic map mirrors how our brain creates connections between related pieces of information."),
            image: "./avatars/mariam.png"
        }
    ] as Testimonial[];

    return (
        <Grid2 container
            m={0}
            xs={12}
            id='testimonial-section'
            padding={0}
            sx={{scrollSnapAlign: 'start'}}
        >
            {testimonials.map((testimonial, index) => (
                <Grid2 m={0} p={1} xs={12} sm={12} md={6} lg={4} key={index} width={'100%'}>
                    <Box
                        p={2}
                        display="flex"
                        flexDirection="column"
                        alignItems="flex-start"
                        height={'200px'}
                        width={'360px'}
                        m={'8px'}
                    >
                        <Box
                            display={'flex'}
                            flexDirection={'row'}
                            alignItems={'center'}
                        >
                            <Avatar alt={testimonial.name} src={testimonial.image}/>
                            <Typography variant="h6" align="center" fontWeight={'bold'} ml={2}>
                                {testimonial.name}
                            </Typography>
                        </Box>
                        <Typography>{testimonial.message}</Typography>
                    </Box>
                </Grid2>
            ))}

        </Grid2>
    )
}

export default Testimonials;
