<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { MangaBackend, MangaChapter } from './assets/lib/Interfaces';
import * as bootstrap from 'bootstrap';

const search = ref('');

const infoBackend = ref<MangaBackend[]>([]);

async function sendData() {
    const response = await fetch('http://localhost:3000/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search: search.value }),
    });

    const data = await response.json();

    infoBackend.value = data;

    infoBackend.value.forEach((item) => {
        if (item.title.length > 30) {
            item.title = item.title.slice(0, 30) + '...';
        }
    });
}

const selectedManga = ref<MangaBackend>();

function selectManga(item: MangaBackend) {
    selectedManga.value = item;
    sendSelectedManga();
}

const mangaChapters = ref<MangaChapter>();

async function sendSelectedManga() {
    try {
        const response = await fetch('http://localhost:3000/manga', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ link: selectedManga.value?.link }),
        });

        const data = await response.json();

        mangaChapters.value = data;
    } catch (error) {
        console.log(error);
    }
}

// Modal bootstrap
const modal = ref<bootstrap.Modal>();

function openModal() {
    modal.value?.show();
}

function closeModal() {
    modal.value?.hide();

    chapterImages.value = [];
}

onMounted(() => {
    modal.value = new bootstrap.Modal(
        document.getElementById('exampleModal') as HTMLElement
    );
});

// Send chapter to backend and get images

const chapterImages = ref<string[]>([]);

async function sendChapterToBackend(index: number) {
    try {
        const response = await fetch('http://localhost:3000/chapter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                link: mangaChapters.value?.chapters[index],
            }),
        });

        const data = await response.json();
        console.log(data);
        if (data.length > 0) {
            chapterImages.value = data[0];
        } else {
            chapterImages.value = [
                'https://linube.com/blog/wp-content/uploads/error-404.jpg',
            ];
        }

        chapterImages.value.forEach((element) => {
            console.log(element);
        });

        chapterImages.value.pop();
    } catch (error) {
        console.log(error);
    }
}

watch(chapterImages, () => {
    console.log(chapterImages.value);
});

function reloadImages() {
    chapterImages.value = [];
}

// Show caption
const showCaption = ref<boolean>(false);
</script>

<template>
    <div class="container mt-5">
        <h1 class="text-center text-primary fw-bold">Buscador Manga</h1>

        <!-- Search -->
        <div class="d-flex justify-content-center align-items-center flex-column">
            <input
                type="text"
                v-model="search"
                placeholder="Busca tu manga favorito"
                class="form-control w-50"
                @keyup.enter="sendData" />
            <button @click="sendData" class="btn btn-primary mt-3 mb-3">
                Buscar
            </button>
        </div>

        <!-- Manga info -->
        <div v-if="infoBackend" class="row">
            <div v-for="item in infoBackend" :key="item.title" class="col-md-3 mb-3">
                <div class="card h-100" @click="openModal">
                    <img
                        :src="item.image"
                        :alt="item.title + ' image'"
                        @click="selectManga(item)"
                        class="card-img-top img-fluid rounded mx-auto mt-3" />
                    <div class="card-body">
                        <h5 class="card-title">{{ item.title }}</h5>
                        <a
                            :href="item.link"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="card-text text-primary fw-bold cursor-pointer">
                            Ver Manga en LeerCapitulo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div
        class="modal fade"
        id="exampleModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5
                        v-if="mangaChapters?.mangaTitle"
                        class="modal-title"
                        id="exampleModalLabel">
                        Capítulos de <em>{{ mangaChapters?.mangaTitle }}</em>
                    </h5>

                    <h5 v-else class="modal-title" id="exampleModalLabel">
                        Cargando...
                    </h5>

                    <button
                        @click="closeModal"
                        type="button"
                        class="close animated tada"
                        data-dismiss="modal"
                        aria-label="Close ">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- Chapters -->
                    <div v-if="mangaChapters" class="row">
                        <div class="row">
                            <div
                                v-for="(
                                    chapterTitle, index
                                ) in mangaChapters.chapters_titles"
                                :key="chapterTitle"
                                class="col-md-4 mb-3">
                                <div class="card">
                                    <div class="card-body">
                                        <h5 class="card-title">
                                            {{ chapterTitle }}
                                        </h5>
                                    </div>

                                    <div class="card-footer">
                                        <a
                                            :href="mangaChapters.chapters[index]"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="btn btn-link">
                                            Leer Capítulo
                                        </a>
                                        <button
                                            @click="sendChapterToBackend(index)"
                                            class="btn btn-info btn-sm">
                                            Enviar al backend
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Spinner -->
                    <div
                        v-else
                        class="d-flex justify-content-center align-items-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>

                    <!-- Chapter images -->

                    <!-- Carousel Bootstrap -->
                    <div
                        v-if="chapterImages"
                        id="carouselExampleIndicators"
                        class="carousel slide"
                        data-bs-ride="carousel">
                        <ol class="carousel-indicators">
                            <li
                                v-for="(imagen, index) in chapterImages"
                                :key="index"
                                :data-bs-target="'#carouselExampleIndicators'"
                                :data-bs-slide-to="index"
                                :class="{ active: index === 0 }"></li>
                        </ol>
                        <div class="carousel-inner">
                            <div
                                v-for="(imagen, index) in chapterImages"
                                :key="index"
                                :class="{
                                    'carousel-item': true,
                                    active: index === 0,
                                }"
                                @mouseover="showCaption = true"
                                @mouseleave="showCaption = false">
                                <img
                                    :src="imagen"
                                    class="d-block w-100"
                                    :alt="mangaChapters?.chapters_titles[index]" />

                                <!-- This line need a modification -->
                                <div
                                    v-if="showCaption"
                                    class="carousel-caption d-md-block bg-dark rounded text-white p-2">
                                    <h5>
                                        {{
                                            mangaChapters?.chapters_titles[index] ||
                                            'Capítulo ' +
                                                (index + 1) +
                                                ' ' +
                                                mangaChapters?.mangaTitle
                                        }}
                                    </h5>
                                </div>
                            </div>
                        </div>
                        <a
                            class="carousel-control-prev"
                            href="#carouselExampleIndicators"
                            role="button"
                            data-bs-slide="prev">
                            <span
                                class="carousel-control-prev-icon"
                                aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </a>
                        <a
                            class="carousel-control-next"
                            href="#carouselExampleIndicators"
                            role="button"
                            data-bs-slide="next">
                            <span
                                class="carousel-control-next-icon"
                                aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </a>
                    </div>

                    <!-- Spinner -->
                    <div v-else class="text-center">
                        <h5 class="text-center">Cargando...</h5>
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button
                        @click="closeModal"
                        type="button"
                        class="btn btn-secondary"
                        data-dismiss="modal">
                        Close
                    </button>

                    <button
                        @click="reloadImages"
                        type="button"
                        class="btn btn-danger">
                        Reset Images
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Modal styles */
.modal {
    overflow-y: auto;
}

.modal-dialog {
    max-width: 80%;
    margin: 1.75rem auto;
}

.modal-body {
    max-height: calc(100vh - 210px);
    overflow-y: auto;
}

.modal-footer {
    display: flex;
    justify-content: space-between;
}

.close {
    background: none;
    border: none;
    font-size: 2rem;
    color: #000;
}

.close:hover {
    color: #ff0000;
    transition: all 0.3s ease;

    animation: tada-animation 0.5s ease infinite;
}

/* Card styles */
.card {
    cursor: pointer;
}

.card-img-top:hover {
    filter: brightness(0.8);
    transition: all 0.3s ease;
}

/* Carousel styles */
.carousel-item {
    height: 65vh;
}

.carousel-item img {
    object-fit: contain;
    height: 100%;
}

/* Spinner styles */

.spinner-border {
    width: 3rem;
    height: 3rem;
}

/* Animations */

@keyframes tada-animation {
    0% {
        transform: scale(1);
    }
    10% {
        transform: scale(0.9) rotate(-3deg);
    }
    20% {
        transform: scale(1.1) rotate(3deg);
    }
    30% {
        transform: scale(1.1) rotate(-3deg);
    }
    40% {
        transform: scale(1.1) rotate(3deg);
    }
    50% {
        transform: scale(1.1) rotate(-3deg);
    }
    60% {
        transform: scale(1.1) rotate(3deg);
    }
    70% {
        transform: scale(1.1) rotate(-3deg);
    }
    80% {
        transform: scale(1.1) rotate(3deg);
    }
    90% {
        transform: scale(1.1) rotate(-3deg);
    }
    100% {
        transform: scale(1) rotate(0);
    }
}
</style>
