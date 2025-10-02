import React from 'react';

const ProfileBrief: React.FC = () => {
    return (
        <div className="p-8 sm:p-12 bg-white text-gray-800 font-sans">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-blue-600">Guía de Perfil de Comunicación</h1>
                <p className="text-lg text-gray-600 mt-2">Define la voz de tu marca para la IA</p>
            </header>

            <section className="mb-8">
                <p className="text-base leading-relaxed">
                    Este documento es una guía para ayudarte a construir un <strong>"Perfil de Comunicación"</strong> efectivo. El objetivo es crear un texto descriptivo que le enseñe a la IA a hablar como tú, tu marca o tu empresa. Un perfil bien definido es la clave para generar contenido coherente, auténtico y que conecte con tu audiencia.
                </p>
                <p className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-lg">
                    <strong>Instrucción:</strong> Responde a las siguientes preguntas de la forma más detallada posible. Luego, combina tus respuestas en un párrafo o texto cohesivo. Este será el texto que pegarás en el campo "Perfil de Comunicación" de la aplicación.
                </p>
            </section>

            <div className="space-y-10">
                <section>
                    <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4">1. Identidad y Propósito</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>¿Quién eres?</strong> (Ej: "Somos una consultora de bienestar corporativo", "Soy el CEO de una startup tecnológica", "Somos una marca de moda sostenible").</li>
                        <li><strong>¿Cuál es tu misión o propósito principal?</strong> (Ej: "Ayudamos a las empresas a crear entornos de trabajo más saludables y productivos", "Mi objetivo es inspirar a jóvenes emprendedores").</li>
                        <li><strong>¿Cuáles son tus 3 valores más importantes?</strong> (Ej: "Innovación, sostenibilidad y empatía").</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4">2. Audiencia</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>¿A quién te diriges principalmente?</strong> (Ej: "Líderes de Recursos Humanos en empresas de más de 500 empleados", "Jóvenes de 18 a 25 años interesados en la moda ética").</li>
                        <li><strong>¿Qué necesita o qué problemas tiene tu audiencia?</strong> (Ej: "Necesitan reducir el estrés y el burnout en sus equipos", "Buscan formas de consumir de manera más consciente").</li>
                        <li><strong>¿Cómo quieres que se sientan al interactuar con tu contenido?</strong> (Ej: "Empoderados, informados y cuidados", "Inspirados, comprendidos y entretenidos").</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4">3. Voz y Estilo de Comunicación</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>Describe tu personalidad en 3 adjetivos:</strong> (Ej: "Profesional, cercano y didáctico", "Energético, divertido y directo").</li>
                        <li><strong>¿Usas un lenguaje técnico o sencillo?</strong> (Ej: "Evitamos la jerga y explicamos conceptos complejos de forma simple").</li>
                        <li><strong>¿Cómo es tu relación con los emojis?</strong> (Ej: "Los usamos con moderación para añadir calidez", "Son una parte fundamental de nuestra comunicación", "Nunca los usamos").</li>
                        <li><strong>¿Prefieres frases cortas y directas o párrafos más elaborados?</strong></li>
                        <li><strong>¿Qué tipo de humor utilizas, si aplica?</strong> (Ej: "Irónico y sutil", "Juegos de palabras", "No usamos humor").</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4">4. Reglas y Directrices (Do's & Don'ts)</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>¿Qué temas debes evitar siempre?</strong> (Ej: "Política, religión", "Comparaciones directas con la competencia").</li>
                        <li><strong>¿Hay palabras o frases que siempre debes usar o evitar?</strong> (Ej: "Siempre usar 'colaboradores' en lugar de 'empleados'", "Nunca usar la palabra 'barato'").</li>
                        <li><strong>¿Alguna regla específica sobre el formato?</strong> (Ej: "Siempre incluir una pregunta al final del post", "Numerar las listas con emojis").</li>
                    </ul>
                </section>
            </div>

            <footer className="mt-12 pt-6 border-t-2 border-gray-200 text-center text-gray-500">
                <p>Una vez que tengas tus respuestas, redáctalas en un texto unificado y pégalo en la aplicación. ¡Verás cómo la IA adopta tu voz!</p>
                <p className="mt-2 font-semibold">Posteos 360 &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
};

export default ProfileBrief;