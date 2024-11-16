const apiUrl = 'https://house-of-books-nqoo.onrender.com'; // Alterar para URL da API quando necessário

async function fetchBooks() {
    try {
        const response = await fetch(`${apiUrl}/books?page=0&size=5`);
        if (response.ok) {
            const data = await response.json();
            renderBooks(data.content || []);
        } else {
            throw new Error('Erro ao buscar os livros.');
        }
    } catch (error) {
        console.error(error);
        document.getElementById('response-message').innerHTML = `
            <div class="alert alert-danger">Erro: ${error.message}</div>`;
    }
}

// Renderizar Livros
function renderBooks(books) {
    const booksContainer = document.getElementById('books-list');
    booksContainer.innerHTML = '';

    if (books.length === 0) {
        booksContainer.innerHTML = '<p class="text-warning">Nenhum livro encontrado.</p>';
        return;
    }

    books.forEach(book => {
        const card = `
            <div class="col-md-4 book-card">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${book.name}</h5>
                    <h6 class="card-subtitle text-muted">${book.authorName}</h6>
                    <p class="card-text">${book.description}</p>
                    <p><strong>${getTranslatedText('borrowed')}:</strong> ${book.borrowed ? getTranslatedText('yes') : getTranslatedText('no')}</p>
                    <button class="btn btn-primary btn-sm" onclick="editBook(${book.id})">${getTranslatedText('edit')}</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBookModal(${book.id})">${getTranslatedText('delete')}</button>
                    <button class="btn btn-warning btn-sm" onclick="toggleBorrowed(${book.id}, ${book.borrowed})">
                        ${book.borrowed ? getTranslatedText('return') : getTranslatedText('borrow')}
                    </button>
                </div>
            </div>
        </div>`;
        booksContainer.innerHTML += card;
    });
}

// Adicionar Livro
async function addBook(event) {
    event.preventDefault();

    const book = {
        name: document.getElementById('book-name').value,
        authorName: document.getElementById('book-author').value,
        description: document.getElementById('book-description').value,
        borrowed: false // Inicialmente, o livro não está emprestado
    };

    try {
        const response = await fetch(`${apiUrl}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        });

        if (response.ok) {
            document.querySelector('.book-form').reset();
            fetchBooks();
        } else {
            throw new Error('Erro ao adicionar o livro.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Função para carregar os livros
window.onload = fetchBooks;

function editBook(bookId) {
    // Busque os dados do livro pelo ID
    fetch(`${apiUrl}/books/${bookId}`)
        .then(response => response.json())
        .then(book => {
            // Preencha os campos do modal
            document.getElementById('editBookId').value = book.id;
            document.getElementById('editBookName').value = book.name;
            document.getElementById('editBookAuthor').value = book.authorName;
            document.getElementById('editBookDescription').value = book.description;
            document.getElementById('editBookBorrowed').checked = book.borrowed;

            // Mostre o modal
            const editModal = new bootstrap.Modal(document.getElementById('editBookModal'));
            editModal.show();
        })
        .catch(error => console.error('Erro ao buscar livro:', error));
}

function saveBookChanges() {
    const bookId = document.getElementById('editBookId').value;
    const updatedBook = {
        name: document.getElementById('editBookName').value,
        authorName: document.getElementById('editBookAuthor').value,
        description: document.getElementById('editBookDescription').value,
        borrowed: document.getElementById('editBookBorrowed').checked
    };

    fetch(`${apiUrl}/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBook)
    })
        .then(response => {
            if (response.ok) {
                // Fechar o modal
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
                editModal.hide();

                // Atualizar lista de livros
                fetchBooks();
            } else {
                throw new Error('Erro ao salvar alterações.');
            }
        })
        .catch(error => console.error('Erro:', error));
}

function deleteBookModal(bookId) {
    // Exibe uma confirmação para exclusão
    if (confirm('Você tem certeza que deseja excluir este livro?')) {
        deleteBook(bookId);
    }
}

function deleteBook(bookId) {
    fetch(`${apiUrl}/books/${bookId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                fetchBooks(); // Atualiza a lista de livros após a exclusão
            } else {
                throw new Error('Erro ao excluir livro.');
            }
        })
        .catch(error => console.error('Erro:', error));
}

async function toggleBorrowed(bookId, currentStatus) {
    // Alternar o status de "Emprestado" para "Não Emprestado"
    const updatedStatus = !currentStatus;

    try {
        const response = await fetch(`${apiUrl}/books/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ borrowed: updatedStatus })
        });

        if (response.ok) {
            fetchBooks(); // Atualiza a lista de livros
        } else {
            throw new Error('Erro ao alterar status de empréstimo.');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}
