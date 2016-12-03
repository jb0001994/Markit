package com.markit.android;

import android.app.SearchManager;
import android.content.Intent;
import android.content.Context;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.app.FragmentManager;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.support.v7.widget.SearchView;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.firebase.ui.database.FirebaseRecyclerAdapter;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.squareup.picasso.Picasso;
import android.widget.TextView;
import android.widget.Toast;

import com.firebase.ui.database.FirebaseRecyclerAdapter;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;



public class CardViewActivity extends BaseActivity {

    private Bundle hubInfo;
    private static final String TAG = "CardView";
    private LinearLayoutManager llm;
    private String hub;


    FirebaseDatabase database = FirebaseDatabase.getInstance();
    DatabaseReference mDatabaseReference = database.getReference().child("itemsByHub");
    DatabaseReference userDatabase= mDatabaseReference.child("users").child(getUID()).child("userHub");
    private boolean loggedIn;
    private ListView cardListView;
    private RecyclerView recList;
    //private LinearLayoutManager llm;
    private Context context = this;


//    FirebaseDatabase database = FirebaseDatabase.getInstance();
//     mDatabaseReference = database.getReference().child("items");


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setContentView(R.layout.activity_card_view);
        hub = "Loyola Marymount University";
        hubInfo = getIntent().getExtras();
        if (hubInfo == null && isLoggedIn()) {
            ValueEventListener getHub = new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    hub = (String) dataSnapshot.getValue();
                    //populateCardView(hub);
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {

                }
            };
            userDatabase.addListenerForSingleValueEvent(getHub);

        } else if (hubInfo != null) {
            hub = hubInfo.getString("hub");
            userDatabase.setValue(hub);
            //populateCardView(hub);
        } else {
            hub = "Loyola Marymount University";
            //populateCardView(hub);
        }
        Toast.makeText(this, hub, Toast.LENGTH_SHORT ).show();

        setContentView(R.layout.activity_card_view);

        recList = (RecyclerView) findViewById(R.id.recList);
        if (recList != null) {
            recList.setHasFixedSize(true);
        }

        llm = new LinearLayoutManager(this);
        recList.setLayoutManager(llm);

        FirebaseRecyclerAdapter<ItemObject, CardViewHolder> adapter = new FirebaseRecyclerAdapter<ItemObject, CardViewActivity.CardViewHolder>(
                ItemObject.class, R.layout.card_item, CardViewActivity.CardViewHolder.class, mDatabaseReference.child(hub)) {
            @Override
            public void populateViewHolder(CardViewActivity.CardViewHolder cardViewHolder, ItemObject model, int position) {
                cardViewHolder.title.setText(model.getTitle());

                final String itemID = model.getId();
                cardViewHolder.title.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        Intent itemDetail = new Intent(CardViewActivity.this, ItemDetail.class);
                        //final String itemID = model.getItemID();
                        itemDetail.putExtra("uid", itemID);
                        CardViewActivity.this.startActivity(itemDetail);
                    }
                });
                cardViewHolder.price.setText("$ " + model.getPrice());
                cardViewHolder.uid.setText(model.getUid());
                //cardViewHolder.id.setText(model.getId());
                Picasso.with(context).load(model.getImageUrl()).into(cardViewHolder.photo);
            }
        };
        recList.setAdapter(adapter);

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        //populateCardView();
        ImageView hubPicture = (ImageView) findViewById(R.id.hub_image);
        hubPicture.setImageResource(R.drawable.sample_lmu_photo);
        hubPicture.setScaleType(ImageView.ScaleType.CENTER_CROP);

        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.nav_menu_button);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(new Intent(CardViewActivity.this, Profile.class));
            }
        });

        FloatingActionButton notifications = (FloatingActionButton) findViewById(R.id.notifications_button);
        notifications.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                DrawerLayout drawer = CardViewActivity.super.getDrawerLayout();
                drawer.openDrawer(GravityCompat.END);
                CardViewActivity.super.openNavDrawer();
            }
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_card_view, menu);

//        SearchManager searchManager = (SearchManager) getSystemService(Context.SEARCH_SERVICE);
//        SearchView searchView = (SearchView) menu.findItem(R.id.menu_search).getActionView();
//        // Assumes current activity is the searchable activity
//        searchView.setSearchableInfo(searchManager.getSearchableInfo(getComponentName()));
//        searchView.setIconifiedByDefault(false); // Do not iconify the widget; expand it by default

        return true;
    }

    public void FindItem (View view) {

    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }
        if (id == R.id.profile) {
            startActivity(new Intent(CardViewActivity.this, Profile.class));
            return true;
        }
        if (id == R.id.watching) {
            startActivity(new Intent(CardViewActivity.this, FavoritesListView.class));
            return true;
        }
        if (id == R.id.change_hub) {
            FragmentManager fm = getSupportFragmentManager();
            ChangeHubFragment changeHubFragment = ChangeHubFragment.newInstance("Change Hub");
            changeHubFragment.show(fm,"fragment_change_hub");
            return true;
        }
        if (id == R.id.edit_tags) {
            Intent tagPage = new Intent(CardViewActivity.this, Profile.class);
            tagPage.putExtra("ARG_SECTION_NUMBER", 2);
            startActivity(tagPage);
            return true;
        }
        if (id == R.id.new_listing) {
            startActivity(new Intent(CardViewActivity.this, NewListing.class));
            return true;
        }
        if (id == R.id.chat) {
            startActivity(new Intent(CardViewActivity.this, ChatListView.class));
            return true;
        }
        if (id == R.id.sign_out) {
            FirebaseAuth.getInstance().signOut();
        }

        return super.onOptionsItemSelected(item);
    }

    public void populateCardView (String hub) {
        RecyclerView recList;
        recList = (RecyclerView) findViewById(R.id.recList);
        if (recList != null) {
            recList.setHasFixedSize(true);
        }
        llm = new LinearLayoutManager(this);
        recList.setLayoutManager(llm);

        FirebaseRecyclerAdapter<MarketItem, CardViewActivity.CardViewHolder> adapter = new FirebaseRecyclerAdapter<MarketItem, CardViewActivity.CardViewHolder>(
                MarketItem.class, R.layout.card_item, CardViewActivity.CardViewHolder.class,
                mDatabaseReference.child("itemsByHub").child(hub)) {
            @Override
            public void populateViewHolder(CardViewActivity.CardViewHolder cardViewHolder, final MarketItem model, int position) {
                cardViewHolder.title.setText(model.getTitle());
                cardViewHolder.title.setOnClickListener(new View.OnClickListener() {
                    String itemID = model.getId();
                    @Override
                    public void onClick(View view) {
                        Intent itemDetail = new Intent(CardViewActivity.this,ItemDetail.class);
                        //final String itemID = model.getItemID();
                        itemDetail.putExtra("uid", itemID);
                        CardViewActivity.this.startActivity(itemDetail);
                    }
                });
                cardViewHolder.price.setText("$ " + model.getPrice());
                cardViewHolder.uid.setText(model.getUid());

            }
        };
        recList.setAdapter(adapter);
    }

    @Override
    public void onStart() {
        super.onStart();
    }




    public void setLoggedIn(boolean b) {
        loggedIn = b;
    }

    public static class CardViewHolder extends RecyclerView.ViewHolder {
        TextView title;
        TextView price;
        TextView uid;
        TextView id;
        TextView tags;
        ImageView photo;
        Context context;

        public CardViewHolder(View itemView) {
            super(itemView);
            context = itemView.getContext();
            photo = (ImageView) itemView.findViewById(R.id.photo);
            title = (TextView) itemView.findViewById(R.id.title);
            price = (TextView) itemView.findViewById(R.id.price);
            uid = (TextView) itemView.findViewById(R.id.username);
            id = (TextView) itemView.findViewById(R.id.id);
        }

    }
}