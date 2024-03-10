//check if the given element id is present in the cart
function element_exist(panier, element_id) {
    console.log("is to find", element_id)
    if (panier.length <= 0)
        return 0;
    for (let i = 0; i < panier.length; i++) {
        console.log("item id: ", panier[i].item._id, "check id", element_id)
        if (panier[i].item._id == element_id)
            return 1;
    }
    return 0;
}

//add an item in the cart in the local storage
function ajouterAuPanier(id = null) {
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    let element;
    let articleSideElement;

    if (id == null) //if no pram is given i take the last element in local storage 
        element = JSON.parse(localStorage.getItem('last_article')) 
    else
        element = getArticleById(id);
    if (element_exist(panier, element._id)) {
        for (let i = 0; i < panier.length; i++) {
            if (panier[i].item._id == element._id) {
                panier[i].amount += 1;
            }
        }
    } else { 
        let PanierItem = {
            amount: 1,
            id: element.id,
            item: element 
        };
        if (is_good_page('/panier.html')) {
            articleSideElement = document.getElementById("article-side");
            articleSideElement.innerHTML += createCartArticleHTML(PanierItem);
        }
        panier.push(PanierItem);
    }
    localStorage.setItem('panier', JSON.stringify(panier));
    display_good_ids();
}

//remove an element from the cart
function remove_one(element_id) {
    let panier = JSON.parse(localStorage.getItem('panier'));

    console.log("element id", element_id)
    for (let i = 0; i < panier.length; i++) {
        if (panier[i].item._id == element_id) {
            panier[i].amount -= 1;
            localStorage.setItem('panier', JSON.stringify(panier));
            display_good_ids();
            return true;
        }
    }
    return false;
}

//clear the local storage
function empty_cart()
{
    localStorage.clear();
    return true;
}

function show_element(id) {
    let element = document.getElementById(id);

    if (element == null)
        return;
    element.style.display = "flex";
}

function hide_element(id) {
    let element = document.getElementById(id);

    element.style.display = "none";
}

function is_empty(panier) {
    if (panier == null)
        return true;
    for (let i = 0; i < panier.length; i++) {
        if (panier[i].amount > 0)
            return false;
    }
    return true;
}

function get_cart_cost() {
    let panier = JSON.parse(localStorage.getItem('panier'));
    let total_price = 0;

    if (panier == null || panier.length == 0)
        return total_price;
    for (let i = 0; i < localStorage.length; i++) {
        if (panier[i])
            total_price += panier[i].amount * panier[i].item.price;
    }
    return total_price.toFixed(2); //return with 2 numbers after the coma
}

function is_good_page(page) {
    return window.location.pathname === page;
}

function createCartArticleHTML(article) {
    return `
        <div class="panier-item" id="article-${article.item._id}">
            <img src="https://api.kedufront.juniortaker.com/static/img/${article.item.image}.png" alt="${article.item.name}"/>
            <div>
                <p class="cart-item-title">${article.item.name}</p>
                <p>Quantité: <span id="article-count">${article.amount}</span></p>
                <div class="quantity-selector">
                    <button onclick="ajouterAuPanier(${article.item._id})"><img src="assets/logos/plus.png" alt="logo plus"/></button>
                    <button onclick="remove_one(${article.item._id})"><img src="assets/logos/minus.png" alt="logo minus"/></button>
                </div>
                <p>Prix à l'unité: <span id="article-price">${article.item.price.toFixed(2)}</span></p>
                <p>Total: <span id="total-count">${(article.amount * article.item.price).toFixed(2)}</span></p>
            </div>
        </div>
    `;
}

// function to display only the articles in the cart in the 'panier pager'
function display_good_ids() {
    let panier = JSON.parse(localStorage.getItem('panier'));
    let articleCountSpan;
    let totalCountSpan;
    let articleCount;
    let priceSpan;
    let cartTotalSpan;

    if (!is_good_page("/panier.html"))
        return;
    if (is_empty(panier)) {
        show_element("empty-cart");
        hide_element("article-side");
        hide_element("buy-wrapper");
        return;
    }
    for (let i = 0; i < panier.length; i++) {
        if (panier[i].amount > 0)
            show_element("article-" + panier[i].id);
        else
            hide_element("article-" + panier[i].id);
        articleCountSpan = document.querySelector("#article-" + panier[i].item._id + " > div > p > #article-count");
        totalCountSpan = document.querySelector("#article-" + panier[i].item._id +" > div > p > #total-count");
        priceSpan = document.querySelector("#article-" + panier[i].item._id + " > div > p > #article-price");
        console.log("this is i", panier[i].amount)
        articleCount = panier[i].amount;
        articleCountSpan.textContent = articleCount;
        priceSpan.textContent = panier[i].item.price.toFixed(2) + "€";
        totalCountSpan.textContent = (articleCount * panier[i].item.price).toFixed(2) + "€";
    }
    cartTotalSpan = document.getElementById("command-cost");
    cartTotalSpan.textContent = get_cart_cost();
    show_element("buy-wrapper");
}

//interactc with the API
function create_command(orderDetails) {
    const url = 'https://api.kedufront.juniortaker.com/order/';
    let command_id;

    axios.post(url, orderDetails)
        .then(response => {
            command_id = response.data.command_id
            hide_element("contactForm");
            console.log('Order created successfully:', command_id);
            alert("Commande passée avec succès.\nNuméro de commande: " + command_id);
            empty_cart();
            display_good_ids();
        })
        .catch(error => {
            alert("Erreur dans la création de la commande.");
            if (error.response) {
                console.error('Error creating order:', error.response.data);
            } else if (error.request) {
                console.error('Error creating order: No response received');
            } else {
                console.error('Error creating order:', error.message);
            }
        });
}

//get the information about the client
function handleFormSubmit(event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value
    };

    create_command(formData);
    document.getElementById('contactForm').reset();
}

// Function to setup event listener for form submission
function setupFormEventListener() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', handleFormSubmit);
}

async function getPictureUrl(itemId) {
    
    return `https://api.kedufront.juniortaker.com/static/img/${itemId}.png`;
}

//get all the articles with the API
async function getArticles() {
    let response;

    try {
        response = await axios.get('https://api.kedufront.juniortaker.com/item/');
        return response.data;
    } catch (error) {
        console.error('Error fetching articles:', error);
    }
}

function createArticleHTML(article) {
    return `
    <a href="article.html" class="item" id="article-${article._id}">
        <img src="https://api.kedufront.juniortaker.com/static/img/${article.image}.png" alt="${article.name}" id="image-${article._id}"/>
        <div class="info">
            <h3>${article.name}</h3>
            <p>${article.price}€</p>
        </div>
    </a>
    `;
}
function getArticleById(id) {
    const itemList = JSON.parse(localStorage.getItem('item_list'));
    
    if (Array.isArray(itemList)) {
        return itemList.find(article => article._id === id);
    } else {
        return null;
    }
}

function addItemListToStorage(articles) {
    localStorage.setItem('item_list', JSON.stringify(articles));
}

//assign the function that stock the element in the local storage
function attachItemClickListeners(itemId) {
    const item = document.getElementById(`article-${itemId}`);
    let last_article;
    
    if (item) {
        item.addEventListener('click', function() {
                console.log("there")
            last_article = getArticleById(itemId);
            localStorage.setItem('last_article', JSON.stringify(last_article));
        });
    }
}

// print good info on article.html page
function displayArticleInfo() {
    const lastArticle = JSON.parse(localStorage.getItem('last_article'));
    let titleElement;
    let pictureElement;
    let priceElement;
    let descriptionElement;
    
    if (lastArticle) {
        titleElement = document.getElementById('item-page-title');
        titleElement.textContent = lastArticle.name;

        pictureElement = document.getElementById('item-page-picture');
        pictureElement.src = "https://api.kedufront.juniortaker.com/static/img/" + lastArticle.image + ".png";

        priceElement = document.getElementById('item-page-price');
        priceElement.textContent = lastArticle.price + '€';

        descriptionElement = document.getElementById('item-page-description');
        descriptionElement.textContent = lastArticle.description;
    } else {
        console.error('Error: last_article not found in local storage');
    }
}

//display the list of items given by the API
async function displayArticles() {
    const articlesContainer = document.getElementById('articles');
    const articles = await getArticles();
    let articleHTML;
    let imgUrl;
    let imgElement;

    addItemListToStorage(articles);
    if (articles) {
        articles.forEach(async article => {
            articleHTML = createArticleHTML(article);
            articlesContainer.innerHTML += articleHTML; //add item html to the container
            imgElement = document.getElementById(`image-${article._id}`); //get the image element
            imgUrl = await getPictureUrl(article._id);
            imgElement.src = imgUrl;
            attachItemClickListeners(article._id); //add the function that keeps the last element in the storage to the element
        });
    }
}

function addCartHtml() {
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    let articleSideElement;

    if (panier.length <= 0)
        return;
    for (let i = 0; i < panier.length; i++) {
        articleSideElement = document.getElementById("article-side");
        articleSideElement.innerHTML += createCartArticleHTML(panier[i]);
    }
}

window.onload = function() {
    if (is_good_page("/panier.html")) {
        addCartHtml();
        display_good_ids();
        setupFormEventListener();  
    }
    if (is_good_page("/index.html")) {
        displayArticles();
        attachItemClickListeners();
    }
    if (is_good_page("/article.html")) {
        displayArticleInfo();
}
};

//could add total price on every page too
// add alert before deleting item from the cart
// say that the item was added in the cart