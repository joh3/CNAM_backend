README

Méthode 1:
1) Copier le dossier "pizzatologue" dans le fichier data de mysql à l'adresse :

	C:\wamp64\bin\mysql\mysql5.7.21\data


Méthode 2 :
1) Se rendre sur phpmyadmin 

2) Créer une nouvelle base de données avec comme nom : "PizzatologueV1"

3) Aller dans la console sql et coller les instructions suivantes :

-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le :  sam. 12 mai 2018 à 12:16
-- Version du serveur :  5.6.38
-- Version de PHP :  7.2.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Base de données :  `PizzatologueV1`
--

-- --------------------------------------------------------

--
-- Structure de la table `AdresseFacturation`
--

CREATE TABLE `AdresseFacturation` (
  `idAdresseFacturation` int(11) NOT NULL,
  `adresse` text NOT NULL,
  `codePostal` int(5) NOT NULL,
  `ville` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `adresseFacturation`
--

INSERT INTO `AdresseFacturation` (`idAdresseFacturation`, `adresse`, `codePostal`, `ville`) VALUES
(1, '6 rue de la libération', 31500, 'Toulouse'),
(2, '3 Avenue de la république', 31100, 'Toulouse');

-- --------------------------------------------------------

--
-- Structure de la table `AdresseLivraison`
--

CREATE TABLE `AdresseLivraison` (
  `idAdresseLivraison` int(11) NOT NULL,
  `nomLieu` text NOT NULL,
  `adresse` text NOT NULL,
  `codePostal` varchar(5) NOT NULL,
  `ville` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `Article`
--

CREATE TABLE `Article` (
  `idArticle` int(11) NOT NULL,
  `libelle` varchar(30) NOT NULL,
  `description` text NOT NULL,
  `prixHT` float NOT NULL,
  `idTypeArticle` int(11) NOT NULL,
  `idTva` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `Client`
--

CREATE TABLE `Client` (
  `idClient` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `numTel` int(10) NOT NULL,
  `motDePasse` varchar(50) NOT NULL,
  `idAdresseFacturation` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `Client`
--

INSERT INTO `Client` (`idClient`, `nom`, `prenom`, `email`, `numTel`, `motDePasse`, `idAdresseFacturation`) VALUES
(2, 'Test', 'Test', 'test@mail.com', 12345667, 'motdepasse', 1);

-- --------------------------------------------------------

--
-- Structure de la table `Commande`
--

CREATE TABLE `Commande` (
  `idCommande` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `description` text NOT NULL,
  `prixTotalHT` int(31) NOT NULL,
  `prixTotalTTC` int(31) NOT NULL,
  `prixTotalTVA` float NOT NULL,
  `ordre` int(3),
  `etatAvancement` int(1) NOT NULL,
  `idClient` int(11) NOT NULL,
  `idAdresseLivraison` int(11) NOT NULL,
  `idTournee` int(11) NOT NULL,
  `idEtatCommande` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `Contenir`
--

CREATE TABLE `Contenir` (
  `idCommande` int(11) NOT NULL,
  `idArticle` int(11) NOT NULL,
  `quantite` int(11) NOT NULL,
  `prixHT` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `etatCommande`
--

CREATE TABLE `etatCommande` (
  `idEtatCommande` int(11) NOT NULL,
  `nomEtat` varchar(31) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `Livreur`
--

CREATE TABLE `Livreur` (
  `idLivreur` int(11) NOT NULL,
  `nom` varchar(25) NOT NULL,
  `prenom` varchar(25) NOT NULL,
  `email` varchar(50) NOT NULL,
  `motDePasse` varchar(50) NOT NULL,
  `idStatut` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `Statut`
--

CREATE TABLE `Statut` (
  `idStatut` int(11) NOT NULL,
  `nom` varchar(31) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `Tournee`
--

CREATE TABLE `Tournee` (
  `idTournee` int(11) NOT NULL,
  `coordoonneesX` float NOT NULL,
  `coordoonneesY` float NOT NULL,
  `estTerminee` tinyint(1) NOT NULL,
  `idLivreur` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `TVA`
--

CREATE TABLE `TVA` (
  `idTVA` int(11) NOT NULL,
  `taux` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `TypeArticle`
--

CREATE TABLE `TypeArticle` (
  `idTypeArticle` int(11) NOT NULL,
  `nom` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `TypeArticle`
--

INSERT INTO `TypeArticle` (`idTypeArticle`, `nom`) VALUES
(1, 'Plat'),
(2, 'Boisson');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `adresseFacturation`
--
ALTER TABLE `adresseFacturation`
  ADD PRIMARY KEY (`idAdresseFacturation`);

--
-- Index pour la table `AdresseLivraison`
--
ALTER TABLE `AdresseLivraison`
  ADD PRIMARY KEY (`idAdresseLivraison`);

--
-- Index pour la table `Article`
--
ALTER TABLE `Article`
  ADD PRIMARY KEY (`idArticle`),
  ADD KEY `fk_idTypeArticle` (`idTypeArticle`),
  ADD KEY `fk_idTVA` (`idTva`);

--
-- Index pour la table `Client`
--
ALTER TABLE `Client`
  ADD PRIMARY KEY (`idClient`),
  ADD KEY `fk_idAdresseFacturation` (`idAdresseFacturation`);

--
-- Index pour la table `Commande`
--
ALTER TABLE `Commande`
  ADD PRIMARY KEY (`idCommande`),
  ADD KEY `fk_idclient` (`idClient`),
  ADD KEY `fk_idAdrLivraison` (`idAdresseLivraison`),
  ADD KEY `fk_idTournee` (`idTournee`),
  ADD KEY `fk_idEtatCommande` (`idEtatCommande`);

--
-- Index pour la table `Contenir`
--
ALTER TABLE `Contenir`
  ADD PRIMARY KEY (`idCommande`,`idArticle`);

--
-- Index pour la table `etatCommande`
--
ALTER TABLE `etatCommande`
  ADD PRIMARY KEY (`idEtatCommande`);

--
-- Index pour la table `Livreur`
--
ALTER TABLE `Livreur`
  ADD PRIMARY KEY (`idLivreur`),
  ADD KEY `fk_idStatut` (`idStatut`);

--
-- Index pour la table `Statut`
--
ALTER TABLE `Statut`
  ADD PRIMARY KEY (`idStatut`);

--
-- Index pour la table `Tournee`
--
ALTER TABLE `Tournee`
  ADD PRIMARY KEY (`idTournee`),
  ADD KEY `fk_idLivreur` (`idLivreur`);

--
-- Index pour la table `TVA`
--
ALTER TABLE `TVA`
  ADD PRIMARY KEY (`idTVA`);

--
-- Index pour la table `TypeArticle`
--
ALTER TABLE `TypeArticle`
  ADD PRIMARY KEY (`idTypeArticle`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `adresseFacturation`
--
ALTER TABLE `adresseFacturation`
  MODIFY `idAdresseFacturation` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `AdresseLivraison`
--
ALTER TABLE `AdresseLivraison`
  MODIFY `idAdresseLivraison` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Article`
--
ALTER TABLE `Article`
  MODIFY `idArticle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Client`
--
ALTER TABLE `Client`
  MODIFY `idClient` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `Commande`
--
ALTER TABLE `Commande`
  MODIFY `idCommande` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `etatCommande`
--
ALTER TABLE `etatCommande`
  MODIFY `idEtatCommande` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Livreur`
--
ALTER TABLE `Livreur`
  MODIFY `idLivreur` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Statut`
--
ALTER TABLE `Statut`
  MODIFY `idStatut` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Tournee`
--
ALTER TABLE `Tournee`
  MODIFY `idTournee` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `TVA`
--
ALTER TABLE `TVA`
  MODIFY `idTVA` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `TypeArticle`
--
ALTER TABLE `TypeArticle`
  MODIFY `idTypeArticle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `Article`
--
ALTER TABLE `Article`
  ADD CONSTRAINT `fk_idTVA` FOREIGN KEY (`idTva`) REFERENCES `TVA` (`idTVA`),
  ADD CONSTRAINT `fk_idTypeArticle` FOREIGN KEY (`idTypeArticle`) REFERENCES `TypeArticle` (`idTypeArticle`);

--
-- Contraintes pour la table `Client`
--
ALTER TABLE `Client`
  ADD CONSTRAINT `fk_idAdresseFacturation` FOREIGN KEY (`idAdresseFacturation`) REFERENCES `adresseFacturation` (`idAdresseFacturation`);

--
-- Contraintes pour la table `Commande`
--
ALTER TABLE `Commande`
  ADD CONSTRAINT `fk_idAdrLivraison` FOREIGN KEY (`idAdresseLivraison`) REFERENCES `AdresseLivraison` (`idAdresseLivraison`),
  ADD CONSTRAINT `fk_idEtatCommande` FOREIGN KEY (`idEtatCommande`) REFERENCES `etatCommande` (`idEtatCommande`),
  ADD CONSTRAINT `fk_idTournee` FOREIGN KEY (`idTournee`) REFERENCES `Tournee` (`idTournee`),
  ADD CONSTRAINT `fk_idclient` FOREIGN KEY (`idClient`) REFERENCES `Client` (`idClient`);

--
-- Contraintes pour la table `Livreur`
--
ALTER TABLE `Livreur`
  ADD CONSTRAINT `fk_idStatut` FOREIGN KEY (`idStatut`) REFERENCES `Statut` (`idStatut`);

--
-- Contraintes pour la table `Tournee`
--
ALTER TABLE `Tournee`
  ADD CONSTRAINT `fk_idLivreur` FOREIGN KEY (`idLivreur`) REFERENCES `Livreur` (`idLivreur`);