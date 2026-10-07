exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 450, body: "Método no permitido" };
  }

  try {
    const data = JSON.parse(event.body);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Sincronizado correctamente", status: "ok" })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
