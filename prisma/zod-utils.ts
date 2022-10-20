import {z} from 'zod';

export const username = z.string().min(2, { message: "min_length_2" }).optional();
