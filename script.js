const API_URL = "http://localhost:8084/books";

// Função para buscar os livros da API
async function fetchBooks(page = 0, size = 5) {
    try {
        const response = await fetch(`${API_URL}?page=${page}&size=${size}`);
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        const data = await response.json();
        renderBooks(data);
    } catch (error) {
        console.error("Erro ao buscar os livros:", error);
        alert("Erro ao carregar os livros. Verifique o console para mais detalhes.");
    }
}

// Função para renderizar os livros no HTML
function renderBooks(data) {
    const bookList = document.getElementById("bookList");
    bookList.innerHTML = ""; // Limpa a lista antes de renderizar

    if (data.content.length === 0) {
        bookList.innerHTML = "<p>Nenhum livro encontrado.</p>";
        return;
    }

    data.content.forEach(book => {
        const bookItem = document.createElement("li");
        bookItem.textContent = `${book.title} - ${book.author}`;
        bookList.appendChild(bookItem);
    });

    // Paginação
    const paginationInfo = document.getElementById("paginationInfo");
    paginationInfo.textContent = `Página ${data.pageable.pageNumber + 1} de ${data.totalPages}`;
}

// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    fetchBooks();
});



document.getElementById('add-book-form').addEventListener('submit', async function (event) {
  event.preventDefault(); // Impede o envio padrão do formulário

  // Coleta os dados do formulário
  const name = document.getElementById('name').value;
  const authorName = document.getElementById('authorName').value;
  const description = document.getElementById('description').value;
  const borrowed = document.getElementById('borrowed').value === 'true'; // Converte para booleano

  const bookData = {
      name: name,
      authorName: authorName,
      description: description,
      borrowed: borrowed
  };

  try {
      // Envia o formulário para a API via POST
      const response = await fetch('http://localhost:8084/books', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookData)
      });

      // Verifica se a resposta foi bem-sucedida
      if (response.ok) {
          const data = await response.json();
          document.getElementById('response-message').innerHTML = `<div class="alert alert-success">Livro "${data.name}" adicionado com sucesso!</div>`;
          document.getElementById('add-book-form').reset(); // Reseta o formulário
      } else {
          const errorData = await response.json();
          document.getElementById('response-message').innerHTML = `<div class="alert alert-danger">Erro ao adicionar livro: ${errorData.message}</div>`;
      }
  } catch (error) {
      console.error('Erro ao tentar adicionar o livro:', error);
      document.getElementById('response-message').innerHTML = `<div class="alert alert-danger">Erro de conexão. Tente novamente.</div>`;
  }
});