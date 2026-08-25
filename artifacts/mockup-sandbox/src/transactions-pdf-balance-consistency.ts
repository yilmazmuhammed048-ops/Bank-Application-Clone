export {};

// PDF açılırken ekrandaki "Kalan Bakiye" değerlerine dokunma.
// PDF oluşturucu zaten ekranda görünen bakiye metinlerini doğrudan okuyor.
// Bu dosyadaki eski click listener bakiyeleri yeniden hesaplayıp DOM'u değiştiriyordu;
// bu yüzden mektup/PDF tuşuna basınca hem ekrandaki hem PDF'deki rakamlar değişiyordu.
