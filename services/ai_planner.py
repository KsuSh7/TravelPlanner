from openai import OpenAI


def generate_ai_plan(user, route):

    client = OpenAI()

    places = [p.name for p in route]

    prompt = f"""
You are a travel assistant.

Create a {user['days']}-day itinerary in {user['destination']}.

Places:
{places}

Travel style: {user['travel_type']}
Pace: {user['pace']}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content