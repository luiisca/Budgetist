'use server'

import { cookies } from "next/headers";
import { getCsrfToken } from "next-auth/react";
import { signIn } from "next-auth/react"
import { env } from "~/env"
import { redirect } from "next/navigation";

export async function sendVerifyEmail() {
    // const csrfToken = formData.get('csrfToken') as string;
    // const csrfToken = await getCsrfToken({
    //     req: {
    //         headers: {
    //             cookie: cookies().toString()
    //         }
    //     }
    // })
    // const email = formData.get('email') as string;
    console.log('---✅sendVerifyEmail🤯---');
    // console.log('formData', formData.get('email'));
    //
    const res = await fetch(`http://localhost:3000/api/auth/signin/email`, {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        // @ts-expect-error
        body: new URLSearchParams({
            csrfToken: await getCsrfToken(),
            email: "luiscaf3r@gmail.com",
            callbackUrl: 'http://localhost:3000/simulation',
            json: true,
        }),
    })
    // const res = await fetch('http://localhost:3000/api/testo', {
    //     method: 'post',
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //         text: 'This is a test',
    //         name: 'LuisCA'
    //     })
    // })
    const data = await res.json()
    console.log('🤯endpoint data: ', data)
    // redirect(data.url)
    //
    // try {
    //     const csrfToken = formData.get('csrfToken') as string;
    //     const email = formData.get('email') as string;
    //
    //     if (!csrfToken || !email) {
    //         throw new Error('Could not obtain CSRF token or email');
    //     }
    //
    //     const response = await fetch(`${env.NEXTAUTH_URL}/api/auth/signin/email`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded',
    //             // Include any other headers if necessary
    //         },
    //         body: new URLSearchParams({
    //             csrfToken,
    //             email,
    //             callbackUrl: `${env.NEXTAUTH_URL}/simulation`,
    //         }),
    //     });
    //
    //     // Check if the response is successful (status code 200)
    //     if (response.ok) {
    //         // Check if the response is in JSON format
    //         const contentType = response.headers.get('content-type');
    //         if (contentType && contentType.includes('application/json')) {
    //             // Parse the JSON response
    //             const responseData = await response.json();
    //             console.log('Response data:', responseData);
    //             // Handle the JSON response data as needed
    //         } else {
    //             // Handle non-JSON response (possibly HTML or other format)
    //             const responseText = await response.text();
    //             console.warn('Non-JSON response:', responseText);
    //             // You might want to handle or log the HTML response here
    //         }
    //     } else {
    //         // Handle other response codes if needed
    //         console.error('Unexpected response:', response.status);
    //     }
    // } catch (error) {
    //     console.error('Error:', error.message);
    //     // Handle the error accordingly
    // }
}

